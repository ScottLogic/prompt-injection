import { Response } from 'express';

import { transformMessage, detectTriggeredDefences } from '@src/defence';
import { OpenAiAddHistoryRequest } from '@src/models/api/OpenAiAddHistoryRequest';
import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';
import { OpenAiClearRequest } from '@src/models/api/OpenAiClearRequest';
import { OpenAiGetHistoryRequest } from '@src/models/api/OpenAiGetHistoryRequest';
import {
	CHAT_MESSAGE_TYPE,
	ChatHistoryMessage,
	ChatHttpResponse,
	ChatModel,
	defaultChatModel,
} from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';
import { chatGptSendMessage } from '@src/openai';

import { handleChatError } from './handleError';

// handle the chat logic for level 1 and 2 with no defences applied
async function handleLowLevelChat(
	req: OpenAiChatRequest,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel
) {
	// get the chatGPT reply
	const openAiReply = await chatGptSendMessage(
		req.session.levelState[currentLevel].chatHistory,
		req.session.levelState[currentLevel].defences,
		chatModel,
		chatResponse.transformedMessage,
		false,
		req.session.levelState[currentLevel].sentEmails,
		currentLevel
	);
	chatResponse.reply = openAiReply.completion?.content?.toString() ?? '';
	chatResponse.wonLevel = openAiReply.wonLevel;
	chatResponse.openAIErrorMessage = openAiReply.openAIErrorMessage;
}

// handle the chat logic for high levels (with defence detection)
async function handleHigherLevelChat(
	req: OpenAiChatRequest,
	message: string,
	chatHistoryBefore: ChatHistoryMessage[],
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel
) {
	// transform the message according to active defences
	chatResponse.transformedMessage = transformMessage(
		message,
		req.session.levelState[currentLevel].defences
	);
	// if message has been transformed then add the original to chat history and send transformed to chatGPT
	const messageIsTransformed = chatResponse.transformedMessage !== message;
	if (messageIsTransformed) {
		req.session.levelState[currentLevel].chatHistory.push({
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.USER,
			infoMessage: message,
		});
	}
	// detect defences on input message
	const triggeredDefencesPromise = detectTriggeredDefences(
		message,
		req.session.levelState[currentLevel].defences
	).then((DefenceReport) => {
		chatResponse.defenceReport = DefenceReport;
	});

	// get the chatGPT reply
	const openAiReplyPromise = chatGptSendMessage(
		req.session.levelState[currentLevel].chatHistory,
		req.session.levelState[currentLevel].defences,
		chatModel,
		chatResponse.transformedMessage,
		messageIsTransformed,
		req.session.levelState[currentLevel].sentEmails,
		currentLevel
	);

	// run defence detection and chatGPT concurrently
	const [, openAiReply] = await Promise.all([
		triggeredDefencesPromise,
		openAiReplyPromise,
	]);

	// if input message is blocked, restore the original chat history and add user message (not as completion)
	if (chatResponse.defenceReport.isBlocked) {
		// restore the original chat history
		req.session.levelState[currentLevel].chatHistory = chatHistoryBefore;

		req.session.levelState[currentLevel].chatHistory.push({
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.USER,
			infoMessage: message,
		});
	} else {
		chatResponse.wonLevel = openAiReply.wonLevel;
		chatResponse.reply = openAiReply.completion?.content?.toString() ?? '';

		// combine triggered defences
		chatResponse.defenceReport.triggeredDefences = [
			...chatResponse.defenceReport.triggeredDefences,
			...openAiReply.defenceReport.triggeredDefences,
		];
		// combine blocked
		chatResponse.defenceReport.isBlocked = openAiReply.defenceReport.isBlocked;

		// combine blocked reason
		chatResponse.defenceReport.blockedReason =
			openAiReply.defenceReport.blockedReason;

		// combine error message
		chatResponse.openAIErrorMessage = openAiReply.openAIErrorMessage;
	}
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
		transformedMessage: '',
		wonLevel: false,
		isError: false,
		openAIErrorMessage: null,
		sentEmails: [],
	};
	const message = req.body.message;
	const currentLevel = req.body.currentLevel;

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

	// keep track of the number of sent emails
	const numSentEmails = req.session.levelState[currentLevel].sentEmails.length;

	// set the transformed message to begin with
	chatResponse.transformedMessage = message;

	// use default model for levels, allow user to select in sandbox
	const chatModel =
		currentLevel === LEVEL_NAMES.SANDBOX
			? req.session.chatModel
			: defaultChatModel;

	// record the history before chat completion called
	const chatHistoryBefore = [
		...req.session.levelState[currentLevel].chatHistory,
	];
	try {
		// skip defence detection / blocking for levels 1 and 2 - sets chatResponse obj
		if (currentLevel < LEVEL_NAMES.LEVEL_3) {
			await handleLowLevelChat(req, chatResponse, currentLevel, chatModel);
		} else {
			// apply the defence detection for level 3 and sandbox - sets chatResponse obj
			await handleHigherLevelChat(
				req,
				message,
				chatHistoryBefore,
				chatResponse,
				currentLevel,
				chatModel
			);
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to get chatGPT reply';
		handleErrorGettingReply(req, res, currentLevel, chatResponse, errorMessage);
		return;
	}

	if (chatResponse.defenceReport.isBlocked) {
		// chatReponse.reply is empty if blocked
		req.session.levelState[currentLevel].chatHistory.push({
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
			infoMessage: chatResponse.defenceReport.blockedReason,
		});
	}
	// more error handling
	else if (chatResponse.openAIErrorMessage) {
		handleErrorGettingReply(
			req,
			res,
			currentLevel,
			chatResponse,
			simplifyOpenAIErrorMessage(chatResponse.openAIErrorMessage)
		);
		return;
	} else if (!chatResponse.reply) {
		handleErrorGettingReply(
			req,
			res,
			currentLevel,
			chatResponse,
			'Failed to get chatGPT reply'
		);
		return;
	}

	// update sent emails
	chatResponse.sentEmails =
		req.session.levelState[currentLevel].sentEmails.slice(numSentEmails);

	console.log(chatResponse);
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

function handleErrorGettingReply(
	req: OpenAiChatRequest,
	res: Response,
	currentLevel: LEVEL_NAMES,
	chatResponse: ChatHttpResponse,
	errorMessage: string
) {
	// add error message to chat history
	req.session.levelState[currentLevel].chatHistory.push({
		completion: null,
		chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG,
		infoMessage: errorMessage,
	});
	console.error(errorMessage);

	handleChatError(res, chatResponse, true, errorMessage);
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
