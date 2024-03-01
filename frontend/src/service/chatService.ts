import {
	CHAT_MESSAGE_TYPE,
	ChatMessageDTO,
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
		body: { level },
	});
	return response.status === 200;
}

async function sendMessage(message: string, currentLevel: LEVEL_NAMES) {
	const response = await sendRequest(`${PATH}chat`, {
		method: 'POST',
		body: { message, currentLevel },
	});
	return (await response.json()) as ChatResponse;
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
		body: { model },
	});
	return response.status === 200;
}

async function configureGptModel(
	configId: MODEL_CONFIG,
	value: number
): Promise<boolean> {
	const response = await sendRequest(`${PATH}model/configure`, {
		method: 'POST',
		body: { configId, value },
	});
	return response.status === 200;
}

async function getGptModel(): Promise<ChatModel> {
	const response = await sendRequest(`${PATH}model`);
	return (await response.json()) as ChatModel;
}

async function addInfoMessageToChatHistory(
	message: string,
	chatMessageType: CHAT_MESSAGE_TYPE,
	level: number
) {
	const response = await sendRequest(`${PATH}addInfoToHistory`, {
		method: 'POST',
		body: {
			infoMessage: message,
			chatMessageType,
			level,
		},
	});
	return response.status === 200;
}

export {
	clearChat,
	sendMessage,
	configureGptModel,
	getGptModel,
	setGptModel,
	addInfoMessageToChatHistory,
	getChatMessagesFromDTOResponse,
};
