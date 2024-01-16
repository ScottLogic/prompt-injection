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
	const combinedReport: ChatDefenceReport = {
		blockedReason: reports
			.filter((report) => report.blockedReason !== null)
			.map((report) => report.blockedReason)
			.join('\n'),
		isBlocked: reports.some((report) => report.isBlocked),
		alertedDefences: reports.flatMap((report) => report.alertedDefences),
		triggeredDefences: reports.flatMap((report) => report.triggeredDefences),
	};
	return combinedReport;
}

function createNewUserMessages(
	message: string,
	transformedMessage: string | null
): ChatHistoryMessage[] {
	if (transformedMessage) {
		// if message has been transformed
		return [
			// original message
			{
				completion: null,
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				infoMessage: message,
			},
			// transformed message
			{
				completion: {
					role: 'user',
					content: transformedMessage,
				},
				chatMessageType: CHAT_MESSAGE_TYPE.USER_TRANSFORMED,
			},
		];
	} else {
		// not transformed, so just return the original message
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

// handle the chat logic for level 1 and 2 with no defences applied
async function handleLowLevelChat(
	message: string,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel,
	chatHistory: ChatHistoryMessage[],
	defences: Defence[]
): Promise<LevelHandlerResponse> {
	const updatedChatHistory = createNewUserMessages(message, null).reduce(
		pushMessageToHistory,
		chatHistory
	);

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
	};
	return {
		chatResponse: updatedChatResponse,
		chatHistory: openAiReply.chatHistory,
		sentEmails: openAiReply.sentEmails,
	};
}

// handle the chat logic for high levels (with defence detection)
async function handleHigherLevelChat(
	message: string,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel,
	chatHistory: ChatHistoryMessage[],
	defences: Defence[]
): Promise<LevelHandlerResponse> {
	// transform the message according to active defences
	const transformedMessage = transformMessage(message, defences);
	const chatHistoryWithNewUserMessages = createNewUserMessages(
		message,
		transformedMessage ? combineTransformedMessage(transformedMessage) : null
	).reduce(pushMessageToHistory, chatHistory);

	// detect defences on input message
	const triggeredInputDefencesPromise = detectTriggeredInputDefences(
		message,
		defences
	);

	// get the chatGPT reply
	const openAiReplyPromise = chatGptSendMessage(
		chatHistoryWithNewUserMessages,
		defences,
		chatModel,
		transformedMessage
			? combineTransformedMessage(transformedMessage)
			: message,
		currentLevel
	);

	// run defence detection and chatGPT concurrently
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
		transformedMessage: transformedMessage ? transformedMessage : undefined,
		wonLevel:
			openAiReply.chatResponse.wonLevel && !combinedDefenceReport.isBlocked,
	};
	return {
		chatResponse: updatedChatResponse,
		chatHistory: updatedChatHistory,
		sentEmails: combinedDefenceReport.isBlocked ? [] : openAiReply.sentEmails,
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

	let levelResult = null;
	try {
		// skip defence detection / blocking for levels 1 and 2 - sets chatResponse obj
		if (currentLevel < LEVEL_NAMES.LEVEL_3) {
			levelResult = await handleLowLevelChat(
				message,
				initChatResponse,
				currentLevel,
				chatModel,
				currentChatHistory,
				defences
			);
		} else {
			// apply the defence detection for level 3 and sandbox
			levelResult = await handleHigherLevelChat(
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
	totalSentEmails.push(...levelResult.sentEmails);

	// update chat response
	const updatedChatResponse: ChatHttpResponse = {
		...initChatResponse,
		reply: levelResult.chatResponse.reply,
		wonLevel: levelResult.chatResponse.wonLevel,
		openAIErrorMessage: levelResult.chatResponse.openAIErrorMessage,
		sentEmails: levelResult.sentEmails,
		defenceReport: levelResult.chatResponse.defenceReport,
		transformedMessage: levelResult.chatResponse.transformedMessage,
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
