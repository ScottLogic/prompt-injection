import { Response } from 'express';

import {
	transformMessage,
	detectTriggeredInputDefences,
	combineTransformedMessage,
	detectTriggeredOutputDefences,
} from '@src/defence';
import { OpenAiAddHistoryRequest } from '@src/models/api/OpenAiAddHistoryRequest';
import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';
import { OpenAiClearRequest } from '@src/models/api/OpenAiClearRequest';
import { OpenAiGetHistoryRequest } from '@src/models/api/OpenAiGetHistoryRequest';
import {
	CHAT_MESSAGE_TYPE,
	ChatDefenceReport,
	ChatHistoryMessage,
	ChatHttpResponse,
	ChatModel,
	LevelHandlerResponse,
	TransformedChatMessage,
	defaultChatModel,
} from '@src/models/chat';
import { Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import { chatGptSendMessage } from '@src/openai';
import { pushMessageToHistory } from '@src/utils/chat';

import { handleChatError } from './handleError';

function combineChatDefenceReports(
	reports: ChatDefenceReport[]
): ChatDefenceReport {
	return {
		blockedReason: reports
			.filter((report) => report.blockedReason !== null)
			.map((report) => report.blockedReason)
			.join('\n'),
		isBlocked: reports.some((report) => report.isBlocked),
		alertedDefences: reports.flatMap((report) => report.alertedDefences),
		triggeredDefences: reports.flatMap((report) => report.triggeredDefences),
	};
}

function createNewUserMessages(
	message: string,
	transformedMessage: TransformedChatMessage | null,
	transformedMessageCombined: string | null,
	transformedMessageInfo: string | null
): ChatHistoryMessage[] {
	if (transformedMessageCombined && transformedMessage) {
		return [
			{
				completion: null,
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				infoMessage: message,
			},
			{
				completion: null,
				chatMessageType: CHAT_MESSAGE_TYPE.INFO,
				infoMessage: transformedMessageInfo,
			},
			{
				completion: {
					role: 'user',
					content: transformedMessageCombined,
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER_TRANSFORMED,
				transformedMessage,
			},
		];
	} else {
		return [
			{
				completion: {
					role: 'user',
					content: message,
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
			},
		];
	}
}

async function handleChatWithoutDefenceDetection(
	message: string,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel,
	chatHistory: ChatHistoryMessage[],
	defences: Defence[]
): Promise<LevelHandlerResponse> {
	const updatedChatHistory = createNewUserMessages(
		message,
		null,
		null,
		null
	).reduce(pushMessageToHistory, chatHistory);

	// get the chatGPT reply
	const openAiReply = await chatGptSendMessage(
		updatedChatHistory,
		defences,
		chatModel,
		message,
		currentLevel
	);

	const updatedChatResponse: ChatHttpResponse = {
		...chatResponse,
		reply: openAiReply.chatResponse.completion?.content?.toString() ?? '',
		wonLevel: openAiReply.chatResponse.wonLevel,
		openAIErrorMessage: openAiReply.chatResponse.openAIErrorMessage,
		sentEmails: openAiReply.sentEmails,
	};
	return {
		chatResponse: updatedChatResponse,
		chatHistory: openAiReply.chatHistory,
	};
}

async function handleChatWithDefenceDetection(
	message: string,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel,
	chatHistory: ChatHistoryMessage[],
	defences: Defence[]
): Promise<LevelHandlerResponse> {
	const transformedMessage = transformMessage(message, defences);
	const transformedMessageCombined = transformedMessage
		? combineTransformedMessage(transformedMessage)
		: null;
	const transformedMessageInfo = transformedMessage
		? `${transformedMessage.transformationName} enabled, your message has been transformed`.toLocaleLowerCase()
		: null;
	const chatHistoryWithNewUserMessages = createNewUserMessages(
		message,
		transformedMessage,
		transformedMessageCombined,
		transformedMessageInfo
	).reduce(pushMessageToHistory, chatHistory);

	const triggeredInputDefencesPromise = detectTriggeredInputDefences(
		message,
		defences
	);

	const openAiReplyPromise = chatGptSendMessage(
		chatHistoryWithNewUserMessages,
		defences,
		chatModel,
		transformedMessageCombined ?? message,
		currentLevel
	);

	// run input defence detection and chatGPT concurrently
	const [inputDefenceReport, openAiReply] = await Promise.all([
		triggeredInputDefencesPromise,
		openAiReplyPromise,
	]);

	const botReply = openAiReply.chatResponse.completion?.content?.toString();
	const outputDefenceReport = botReply
		? detectTriggeredOutputDefences(botReply, defences)
		: null;

	const defenceReports = outputDefenceReport
		? [inputDefenceReport, outputDefenceReport]
		: [inputDefenceReport];
	const combinedDefenceReport = combineChatDefenceReports(defenceReports);

	// if blocked, restore original chat history and add user message to chat history without completion
	const updatedChatHistory = combinedDefenceReport.isBlocked
		? pushMessageToHistory(chatHistory, {
				completion: null,
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				infoMessage: message,
		  })
		: openAiReply.chatHistory;

	const updatedChatResponse: ChatHttpResponse = {
		...chatResponse,
		defenceReport: combinedDefenceReport,
		openAIErrorMessage: openAiReply.chatResponse.openAIErrorMessage,
		reply: !combinedDefenceReport.isBlocked && botReply ? botReply : '',
		transformedMessage: transformedMessage ?? undefined,
		wonLevel:
			openAiReply.chatResponse.wonLevel && !combinedDefenceReport.isBlocked,
		sentEmails: combinedDefenceReport.isBlocked ? [] : openAiReply.sentEmails,
		transformedMessageInfo: transformedMessageInfo ?? undefined,
	};
	return {
		chatResponse: updatedChatResponse,
		chatHistory: updatedChatHistory,
	};
}

async function handleChatToGPT(req: OpenAiChatRequest, res: Response) {
	// set reply params
	const initChatResponse: ChatHttpResponse = {
		reply: '',
		defenceReport: {
			blockedReason: null,
			isBlocked: false,
			alertedDefences: [],
			triggeredDefences: [],
		},
		wonLevel: false,
		isError: false,
		openAIErrorMessage: null,
		sentEmails: [],
	};
	const { message, currentLevel } = req.body;

	if (!message || currentLevel === undefined) {
		handleChatError(
			res,
			initChatResponse,
			'Missing or empty message or level',
			400
		);
		return;
	}

	const MESSAGE_CHARACTER_LIMIT = 16384;
	if (message.length > MESSAGE_CHARACTER_LIMIT) {
		handleChatError(
			res,
			initChatResponse,
			'Message exceeds character limit',
			400
		);
		return;
	}
	const totalSentEmails: EmailInfo[] = [
		...req.session.levelState[currentLevel].sentEmails,
	];

	// use default model for levels, allow user to select in sandbox
	const chatModel =
		currentLevel === LEVEL_NAMES.SANDBOX
			? req.session.chatModel
			: defaultChatModel;

	const currentChatHistory = [
		...req.session.levelState[currentLevel].chatHistory,
	];
	const defences = [...req.session.levelState[currentLevel].defences];

	let levelResult: LevelHandlerResponse;
	try {
		if (currentLevel < LEVEL_NAMES.LEVEL_3) {
			levelResult = await handleChatWithoutDefenceDetection(
				message,
				initChatResponse,
				currentLevel,
				chatModel,
				currentChatHistory,
				defences
			);
		} else {
			levelResult = await handleChatWithDefenceDetection(
				message,
				initChatResponse,
				currentLevel,
				chatModel,
				currentChatHistory,
				defences
			);
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to get chatGPT reply';
		req.session.levelState[currentLevel].chatHistory = addErrorToChatHistory(
			currentChatHistory,
			errorMessage
		);
		handleChatError(res, initChatResponse, errorMessage, 500);
		return;
	}

	let updatedChatHistory = levelResult.chatHistory;
	totalSentEmails.push(...levelResult.chatResponse.sentEmails);

	const updatedChatResponse: ChatHttpResponse = {
		...initChatResponse,
		...levelResult.chatResponse,
	};

	if (updatedChatResponse.defenceReport.isBlocked) {
		// chatReponse.reply is empty if blocked
		updatedChatHistory = pushMessageToHistory(updatedChatHistory, {
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
			infoMessage: updatedChatResponse.defenceReport.blockedReason,
		});
	} else if (updatedChatResponse.openAIErrorMessage) {
		const errorMsg = simplifyOpenAIErrorMessage(
			updatedChatResponse.openAIErrorMessage
		);
		req.session.levelState[currentLevel].chatHistory = addErrorToChatHistory(
			updatedChatHistory,
			errorMsg
		);
		handleChatError(res, updatedChatResponse, errorMsg, 500);
		return;
	} else if (!updatedChatResponse.reply) {
		const errorMsg = 'Failed to get chatGPT reply';
		req.session.levelState[currentLevel].chatHistory = addErrorToChatHistory(
			updatedChatHistory,
			errorMsg
		);
		handleChatError(res, updatedChatResponse, errorMsg, 500);
		return;
	} else {
		// add bot message to chat history
		updatedChatHistory = pushMessageToHistory(updatedChatHistory, {
			completion: {
				role: 'assistant',
				content: updatedChatResponse.reply,
			},
			chatMessageType: CHAT_MESSAGE_TYPE.BOT,
		});
	}

	// update state
	req.session.levelState[currentLevel].chatHistory = updatedChatHistory;
	req.session.levelState[currentLevel].sentEmails = totalSentEmails;

	console.log('chatResponse: ', updatedChatResponse);
	console.log('chatHistory: ', updatedChatHistory);

	res.send(updatedChatResponse);
}

function simplifyOpenAIErrorMessage(openAIErrorMessage: string) {
	if (openAIErrorMessage.startsWith('429')) {
		const tryAgainMessage = openAIErrorMessage
			.split('. ')
			.find((sentence) => sentence.includes('Please try again in'));
		return `I'm receiving too many requests. ${tryAgainMessage}. You can upgrade your open AI key to increase the rate limit.`;
	} else {
		return 'Failed to get ChatGPT reply.';
	}
}

function addErrorToChatHistory(
	chatHistory: ChatHistoryMessage[],
	errorMessage: string
): ChatHistoryMessage[] {
	console.error(errorMessage);
	return pushMessageToHistory(chatHistory, {
		completion: null,
		chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG,
		infoMessage: errorMessage,
	});
}

function handleGetChatHistory(req: OpenAiGetHistoryRequest, res: Response) {
	const level: number | undefined = req.query.level as number | undefined;
	if (level !== undefined) {
		res.send(req.session.levelState[level].chatHistory);
	} else {
		res.status(400);
		res.send('Missing level');
	}
}

function handleAddToChatHistory(req: OpenAiAddHistoryRequest, res: Response) {
	const infoMessage = req.body.message;
	const chatMessageType = req.body.chatMessageType;
	const level = req.body.level;
	if (
		infoMessage &&
		chatMessageType &&
		level !== undefined &&
		level >= LEVEL_NAMES.LEVEL_1
	) {
		req.session.levelState[level].chatHistory = pushMessageToHistory(
			req.session.levelState[level].chatHistory,
			{
				completion: null,
				chatMessageType,
				infoMessage,
			}
		);
		res.send();
	} else {
		res.status(400);
		res.send();
	}
}

function handleClearChatHistory(req: OpenAiClearRequest, res: Response) {
	const level = req.body.level;
	if (level !== undefined && level >= LEVEL_NAMES.LEVEL_1) {
		req.session.levelState[level].chatHistory = [];
		console.debug('ChatGPT messages cleared');
		res.send();
	} else {
		res.status(400);
		res.send();
	}
}

export {
	handleChatToGPT,
	handleGetChatHistory,
	handleAddToChatHistory,
	handleClearChatHistory,
};
