import { Response } from 'express';

import {
	transformMessage,
	detectTriggeredDefences,
	combineTransformedMessage,
} from '@src/defence';
import { OpenAiAddHistoryRequest } from '@src/models/api/OpenAiAddHistoryRequest';
import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';
import { OpenAiClearRequest } from '@src/models/api/OpenAiClearRequest';
import { OpenAiGetHistoryRequest } from '@src/models/api/OpenAiGetHistoryRequest';
import {
	CHAT_MESSAGE_TYPE,
	ChatHistoryMessage,
	ChatHttpResponse,
	ChatModel,
	LevelHandlerResponse,
	defaultChatModel,
} from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';
import { chatGptSendMessage } from '@src/openai';

import { handleChatError } from './handleError';

import { EmailInfo } from '@src/models/email';
import { Defence } from '@src/models/defence';

// handle the chat logic for level 1 and 2 with no defences applied
async function handleLowLevelChat(
	message: string,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel,
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	sentEmails: EmailInfo[]
) {
	// get the chatGPT reply
	const openAiReply = await chatGptSendMessage(
		[...chatHistory],
		[...defences],
		chatModel,
		message,
		false,
		[...sentEmails],
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
	defences: Defence[],
	sentEmails: EmailInfo[]
): Promise<LevelHandlerResponse> {
	let updatedChatHistory = [...chatHistory];
	let updatedChatResponse: ChatHttpResponse = {
		...chatResponse,
	};

	console.debug('*** handleHigherLevelChat ***');

	// transform the message according to active defences
	const transformedMessage = transformMessage(message, defences);
	if (transformedMessage) {
		chatResponse.transformedMessage = transformedMessage;
		// if message has been transformed then add the original to chat history and send transformed to chatGPT
		chatHistory.push({
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.USER,
			infoMessage: message,
		});
	}
	console.log('defences: ', defences);
	// detect defences on input message
	const triggeredDefencesPromise = detectTriggeredDefences(message, defences);

	// get the chatGPT reply
	const openAiReplyPromise = chatGptSendMessage(
		chatHistory,
		defences,
		chatModel,
		transformedMessage
			? combineTransformedMessage(transformedMessage)
			: message,
		transformedMessage ? true : false,
		sentEmails,
		currentLevel
	);

	// run defence detection and chatGPT concurrently
	const [defenceReport, openAiReply] = await Promise.all([
		triggeredDefencesPromise,
		openAiReplyPromise,
	]);

	// if input message is blocked, restore the original chat history and add user message (not as completion)
	if (defenceReport.isBlocked) {
		updatedChatHistory = [
			...updatedChatHistory,
			{
				completion: null,
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				infoMessage: message,
			},
		];
		updatedChatResponse.defenceReport = defenceReport;
	} else {
		// Update other fields using immutable operations
		updatedChatResponse = {
			...updatedChatResponse,
			reply: openAiReply.chatResponse.completion?.content?.toString() ?? '',
			wonLevel: openAiReply.chatResponse.wonLevel,
			openAIErrorMessage: openAiReply.chatResponse.openAIErrorMessage,
		};

		updatedChatHistory = openAiReply.chatHistory;

		// combine triggered defences
		defenceReport.triggeredDefences = [
			...chatResponse.defenceReport.triggeredDefences,
			...openAiReply.chatResponse.defenceReport.triggeredDefences,
		];
		// combine blocked
		defenceReport.isBlocked = openAiReply.chatResponse.defenceReport.isBlocked;
		defenceReport.blockedReason =
			openAiReply.chatResponse.defenceReport.blockedReason;
	}

	console.log('updatedChatHistory: ', updatedChatHistory);

	return {
		chatResponse: updatedChatResponse,
		chatHistory: updatedChatHistory,
		sentEmails: openAiReply.sentEmails,
	} as LevelHandlerResponse;
}

async function handleChatToGPT(req: OpenAiChatRequest, res: Response) {
	// set reply params
	const chatResponse: ChatHttpResponse = {
		reply: '',
		defenceReport: {
			blockedReason: '',
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

	// must have initialised openai
	if (!message || currentLevel === undefined) {
		handleChatError(
			res,
			chatResponse,
			true,
			'Missing or empty message or level',
			400
		);
		return;
	}

	const MESSAGE_CHARACTER_LIMIT = 16384;
	if (message.length > MESSAGE_CHARACTER_LIMIT) {
		handleChatError(
			res,
			chatResponse,
			true,
			'Message exceeds character limit',
			400
		);
		return;
	}
	const totalSentEmails: EmailInfo[] = [
		...req.session.levelState[currentLevel].sentEmails,
	];
	// keep track of the number of sent emails
	const numSentEmails = totalSentEmails.length;

	// use default model for levels, allow user to select in sandbox
	const chatModel =
		currentLevel === LEVEL_NAMES.SANDBOX
			? req.session.chatModel
			: defaultChatModel;

	// record the history before chat completion called - incase we need to revert due to block
	const chatHistoryBefore = [
		...req.session.levelState[currentLevel].chatHistory,
	];
	// chat history for updating
	let updatedChatHistory = [...chatHistoryBefore];

	const defences = [...req.session.levelState[currentLevel].defences];

	let levelResult = null;
	try {
		// skip defence detection / blocking for levels 1 and 2 - sets chatResponse obj
		if (currentLevel < LEVEL_NAMES.LEVEL_3) {
			levelResult = await handleLowLevelChat(
				message,
				chatResponse,
				currentLevel,
				chatModel,
				chatHistoryBefore,
				defences,
				totalSentEmails
			);
		} else {
			// apply the defence detection for level 3 and sandbox
			levelResult = await handleHigherLevelChat(
				message,
				chatResponse,
				currentLevel,
				chatModel,
				chatHistoryBefore,
				defences,
				totalSentEmails
			);
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to get chatGPT reply';
		updatedChatHistory = addErrorToChatHistory(
			updatedChatHistory,
			errorMessage
		);
		return;
	}

	console.log('levelResult', levelResult);

	// update chat history
	updatedChatHistory = levelResult.chatHistory;
	totalSentEmails.push(...levelResult.sentEmails);

	// update chat response
	chatResponse.reply = levelResult.chatResponse.reply;
	chatResponse.wonLevel = levelResult.chatResponse.wonLevel;
	chatResponse.openAIErrorMessage = levelResult.chatResponse.openAIErrorMessage;
	chatResponse.sentEmails = levelResult.sentEmails.slice(numSentEmails);
	chatResponse.defenceReport = levelResult.chatResponse.defenceReport;

	if (levelResult.chatResponse.defenceReport.isBlocked) {
		// chatReponse.reply is empty if blocked
		updatedChatHistory.push({
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
			infoMessage: chatResponse.defenceReport.blockedReason,
		});
	}
	// more error handling
	else if (levelResult.chatResponse.openAIErrorMessage) {
		updatedChatHistory = addErrorToChatHistory(
			updatedChatHistory,
			simplifyOpenAIErrorMessage(levelResult.chatResponse.openAIErrorMessage)
		);
	} else if (!levelResult.chatResponse.reply) {
		updatedChatHistory = addErrorToChatHistory(
			updatedChatHistory,
			'Failed to get chatGPT reply'
		);
		// todo - handle error
		return;
	}

	// update state
	req.session.levelState[currentLevel].chatHistory = updatedChatHistory;
	req.session.levelState[currentLevel].sentEmails = totalSentEmails;
	// req.session.levelState[currentLevel].defences = levelResult.defences;

	console.log('chatResponse: ', chatResponse);
	res.send(chatResponse);
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
	const updatedChatHistory = [
		...chatHistory,
		{
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG,
			infoMessage: errorMessage,
		},
	];
	console.error(errorMessage);
	// // add error message to chat history
	// req.session.levelState[currentLevel].chatHistory.push({
	// 	completion: null,
	// 	chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG,
	// 	infoMessage: errorMessage,
	// });
	// console.error(errorMessage);
	// handleChatError(res, chatResponse, true, errorMessage);
	return updatedChatHistory;
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
		req.session.levelState[level].chatHistory.push({
			completion: null,
			chatMessageType,
			infoMessage,
		});
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
