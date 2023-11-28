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
	chatResponse.reply = openAiReply.completion?.content ?? '';
	chatResponse.wonLevel = openAiReply.wonLevel;
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
	let openAiReply = null;

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
	).then((defenceInfo) => {
		chatResponse.defenceInfo = defenceInfo;
	});

	// get the chatGPT reply
	try {
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
		const [, openAiReplyResolved] = await Promise.all([
			triggeredDefencesPromise,
			openAiReplyPromise,
		]);
		openAiReply = openAiReplyResolved;

		// if input message is blocked, restore the original chat history and add user message (not as completion)
		if (chatResponse.defenceInfo.isBlocked) {
			// set to null to stop message being returned to user
			openAiReply = null;

			// restore the original chat history
			req.session.levelState[currentLevel].chatHistory = chatHistoryBefore;

			req.session.levelState[currentLevel].chatHistory.push({
				completion: null,
				chatMessageType: CHAT_MESSAGE_TYPE.USER,
				infoMessage: message,
			});
		}

		if (openAiReply) {
			chatResponse.wonLevel = openAiReply.wonLevel;
			chatResponse.reply = openAiReply.completion?.content ?? '';

			// combine triggered defences
			chatResponse.defenceInfo.triggeredDefences = [
				...chatResponse.defenceInfo.triggeredDefences,
				...openAiReply.defenceInfo.triggeredDefences,
			];
			// combine blocked
			chatResponse.defenceInfo.isBlocked = openAiReply.defenceInfo.isBlocked;

			// combine blocked reason
			chatResponse.defenceInfo.blockedReason =
				openAiReply.defenceInfo.blockedReason;
		}
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
	}
}

async function handleChatToGPT(req: OpenAiChatRequest, res: Response) {
	// set reply params
	const chatResponse: ChatHttpResponse = {
		reply: '',
		defenceInfo: {
			blockedReason: '',
			isBlocked: false,
			alertedDefences: [],
			triggeredDefences: [],
		},
		transformedMessage: '',
		wonLevel: false,
		isError: false,
	};
	const message = req.body.message;
	const currentLevel = req.body.currentLevel;

	// must have initialised openai
	if (message === undefined || currentLevel === undefined) {
		handleChatError(
			res,
			chatResponse,
			true,
			'Please send a message and current level to chat to me!',
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
		if (message) {
			// skip defence detection / blocking for levels 1 and 2- sets chatResponse obj
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
			// if the reply was blocked then add it to the chat history
			if (chatResponse.defenceInfo.isBlocked) {
				req.session.levelState[currentLevel].chatHistory.push({
					completion: null,
					chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
					infoMessage: chatResponse.defenceInfo.blockedReason,
				});
			} else if (!chatResponse.reply || chatResponse.reply === '') {
				// add error message to chat history
				req.session.levelState[currentLevel].chatHistory.push({
					completion: null,
					chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG,
					infoMessage: 'Failed to get chatGPT reply',
				});
				// throw so handle error called
				throw new Error('Failed to get chatGPT reply');
			}
		} else {
			handleChatError(res, chatResponse, true, 'Missing message');
			return;
		}
	} catch (error) {
		handleChatError(res, chatResponse, true, 'Failed to get chatGPT reply');
		return;
	}
	// log and send the reply with defence info
	console.log(chatResponse);
	res.send(chatResponse);
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
