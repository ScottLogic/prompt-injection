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
	combineChatDefenceReports,
	defaultChatModel,
	pushMessageToHistory,
} from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';
import { chatGptSendMessage } from '@src/openai';

import { handleChatError } from './handleError';

function getChatHistoryUserMessages(
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
	req: OpenAiChatRequest,
	message: string,
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel
) {
	const chatHistoryUserMessages = getChatHistoryUserMessages(message, null);
	chatHistoryUserMessages.forEach((message) => {
		pushMessageToHistory(
			req.session.levelState[currentLevel].chatHistory,
			message
		);
	});

	// get the chatGPT reply
	const openAiReply = await chatGptSendMessage(
		req.session.levelState[currentLevel].chatHistory,
		req.session.levelState[currentLevel].defences,
		chatModel,
		message,
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
	chatResponse: ChatHttpResponse,
	currentLevel: LEVEL_NAMES,
	chatModel: ChatModel
) {
	// record the history before chat completion called
	// so we can restore it if the message is blocked
	const chatHistoryBefore = [
		...req.session.levelState[currentLevel].chatHistory,
	];

	// transform the message according to active defences
	const transformedMessage = transformMessage(
		message,
		req.session.levelState[currentLevel].defences
	);

	const chatHistoryUserMessages = getChatHistoryUserMessages(
		message,
		transformedMessage ? combineTransformedMessage(transformedMessage) : null
	);
	chatHistoryUserMessages.forEach((message) => {
		pushMessageToHistory(
			req.session.levelState[currentLevel].chatHistory,
			message
		);
	});

	if (transformedMessage) {
		chatResponse.transformedMessage = transformedMessage;
	}

	// detect defences on input message
	const triggeredDefencesPromise = detectTriggeredInputDefences(
		message,
		req.session.levelState[currentLevel].defences
	);

	// get the chatGPT reply
	const openAiReplyPromise = chatGptSendMessage(
		req.session.levelState[currentLevel].chatHistory,
		req.session.levelState[currentLevel].defences,
		chatModel,
		transformedMessage
			? combineTransformedMessage(transformedMessage)
			: message,
		req.session.levelState[currentLevel].sentEmails,
		currentLevel
	);

	// run defence detection and chatGPT concurrently
	const [inputDefenceReport, openAiReply] = await Promise.all([
		triggeredDefencesPromise,
		openAiReplyPromise,
	]);

	chatResponse.openAIErrorMessage = openAiReply.openAIErrorMessage;

	const botReply = openAiReply.completion?.content?.toString();
	const outputDefenceReport = botReply
		? detectTriggeredOutputDefences(
				botReply,
				req.session.levelState[currentLevel].defences
		  )
		: null;

	const defenceReports = [
		chatResponse.defenceReport,
		inputDefenceReport,
		openAiReply.defenceReport,
	];
	if (outputDefenceReport) {
		defenceReports.push(outputDefenceReport);
	}
	chatResponse.defenceReport = combineChatDefenceReports(defenceReports);

	if (chatResponse.defenceReport.isBlocked) {
		// restore the original chat history
		req.session.levelState[currentLevel].chatHistory = chatHistoryBefore;
		// add user message to the chat history (not as completion)
		pushMessageToHistory(req.session.levelState[currentLevel].chatHistory, {
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.USER,
			infoMessage: message,
		});
	} else {
		chatResponse.wonLevel = openAiReply.wonLevel;
		chatResponse.reply = botReply ?? '';
	}
}

async function handleChatToGPT(req: OpenAiChatRequest, res: Response) {
	// set reply params
	const chatResponse: ChatHttpResponse = {
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

	// use default model for levels, allow user to select in sandbox
	const chatModel =
		currentLevel === LEVEL_NAMES.SANDBOX
			? req.session.chatModel
			: defaultChatModel;

	try {
		// skip defence detection / blocking for levels 1 and 2 - sets chatResponse obj
		if (currentLevel < LEVEL_NAMES.LEVEL_3) {
			await handleLowLevelChat(
				req,
				message,
				chatResponse,
				currentLevel,
				chatModel
			);
		} else {
			// apply the defence detection for level 3 and sandbox - sets chatResponse obj
			await handleHigherLevelChat(
				req,
				message,
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
		pushMessageToHistory(req.session.levelState[currentLevel].chatHistory, {
			completion: null,
			chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
			infoMessage: chatResponse.defenceReport.blockedReason,
		});
	} else if (chatResponse.openAIErrorMessage) {
		// more error handling
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
	} else {
		// add bot message to chat history
		pushMessageToHistory(req.session.levelState[currentLevel].chatHistory, {
			completion: {
				role: 'assistant',
				content: chatResponse.reply,
			},
			chatMessageType: CHAT_MESSAGE_TYPE.BOT,
		});
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
	pushMessageToHistory(req.session.levelState[currentLevel].chatHistory, {
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
		pushMessageToHistory(req.session.levelState[level].chatHistory, {
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
