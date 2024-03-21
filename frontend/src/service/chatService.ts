import {
	CHAT_MESSAGE_TYPE,
	ChatMessageDTO,
	ChatMessage,
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

function makeChatMessageFromDTO(chatMessageDTO: ChatMessageDTO): ChatMessage {
	if (!chatMessageDTOIsConvertible(chatMessageDTO)) {
		throw new Error(
			'Cannot convert chatMessageDTO of type SYSTEM or FUNCTION_CALL to ChatMessage'
		);
	}

	const type = chatMessageDTO.chatMessageType;
	return {
		transformedMessage: chatMessageDTO.transformedMessage ?? undefined,
		message:
			type === 'USER'
				? chatMessageDTO.completion?.content ?? chatMessageDTO.infoMessage ?? ''
				: type === 'BOT' || type === 'USER_TRANSFORMED'
				? chatMessageDTO.completion?.content ?? ''
				: chatMessageDTO.infoMessage ?? '',
		type,
	};
}

function chatMessageDTOIsConvertible(chatMessageDTO: ChatMessageDTO) {
	return (
		chatMessageDTO.chatMessageType !== 'SYSTEM' &&
		chatMessageDTO.chatMessageType !== 'FUNCTION_CALL'
	);
}

function getChatMessagesFromDTOResponse(chatMessageDTOs: ChatMessageDTO[]) {
	return chatMessageDTOs
		.filter(chatMessageDTOIsConvertible)
		.map(makeChatMessageFromDTO);
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

async function addInfoMessageToChatHistory(
	message: string,
	chatMessageType: CHAT_MESSAGE_TYPE,
	level: number
) {
	const response = await sendRequest(`${PATH}addInfoToHistory`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			infoMessage: message,
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
	setGptModel,
	addInfoMessageToChatHistory,
	getChatMessagesFromDTOResponse,
	makeChatMessageFromDTO,
};
