import {
	CHAT_MESSAGE_TYPE,
	ChatHistoryMessage,
	ChatMessage,
	ChatModel,
	ChatResponse,
	MODEL_CONFIG,
} from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

import { sendRequest } from './backendService';

const PATH = 'openai/';

async function clearChat(level: number) {
	const response = await sendRequest(`${PATH}clear`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ level }),
	});
	return response.status === 200;
}

async function sendMessage(message: string, currentLevel: LEVEL_NAMES) {
	const response = await sendRequest(`${PATH}chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, currentLevel }),
	});
	const data = (await response.json()) as ChatResponse;
	return data;
}

async function getChatHistory(level: number): Promise<ChatMessage[]> {
	const response = await sendRequest(`${PATH}history?level=${level}`, {
		method: 'GET',
	});
	const chatHistory = (await response.json()) as ChatHistoryMessage[];
	// convert to ChatMessage object
	const chatMessages: ChatMessage[] = [];
	chatHistory.forEach((message) => {
		switch (message.chatMessageType) {
			case CHAT_MESSAGE_TYPE.USER:
				chatMessages.push({
					message: message.completion?.content ?? message.infoMessage ?? '',
					type: message.chatMessageType,
				});
				break;
			case CHAT_MESSAGE_TYPE.BOT:
			case CHAT_MESSAGE_TYPE.USER_TRANSFORMED:
				chatMessages.push({
					message: message.completion?.content ?? '',
					type: message.chatMessageType,
				});
				break;
			case CHAT_MESSAGE_TYPE.INFO:
			case CHAT_MESSAGE_TYPE.BOT_BLOCKED:
			case CHAT_MESSAGE_TYPE.LEVEL_INFO:
			case CHAT_MESSAGE_TYPE.DEFENCE_ALERTED:
			case CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED:
			case CHAT_MESSAGE_TYPE.RESET_LEVEL:
			case CHAT_MESSAGE_TYPE.ERROR_MSG:
				chatMessages.push({
					message: message.infoMessage ?? '',
					type: message.chatMessageType,
				});
				break;
			default:
				break;
		}
	});
	return chatMessages;
}

async function setGptModel(model: string): Promise<boolean> {
	const response = await sendRequest(`${PATH}model`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model }),
	});
	return response.status === 200;
}

async function configureGptModel(
	configId: MODEL_CONFIG,
	value: number
): Promise<boolean> {
	const response = await sendRequest(`${PATH}model/configure`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ configId, value }),
	});
	return response.status === 200;
}

async function getGptModel(): Promise<ChatModel> {
	const response = await sendRequest(`${PATH}model`, { method: 'GET' });
	return (await response.json()) as ChatModel;
}

async function getValidModels(): Promise<string[]> {
	const response = await sendRequest(`${PATH}validModels`, { method: 'GET' });
	const data = (await response.json()) as {
		models: string[];
	};
	return data.models;
}

async function addMessageToChatHistory(
	message: string,
	chatMessageType: CHAT_MESSAGE_TYPE,
	level: number
) {
	const response = await sendRequest(`${PATH}addHistory`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			message,
			chatMessageType,
			level,
		}),
	});
	return response.status === 200;
}

export {
	clearChat,
	sendMessage,
	configureGptModel,
	getGptModel,
	setGptModel,
	getValidModels,
	getChatHistory,
	addMessageToChatHistory,
};
