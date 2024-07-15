import { ChatInfoMessageResponse } from '@src/models/apiResponse';
import {
	CHAT_MESSAGE_TYPE,
	ChatMessageDTO,
	ChatMessage,
	ChatResponse,
	MODEL_CONFIG_ID,
} from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

import { post } from './backendService';

const PATH = 'openai';

async function sendMessage(message: string, currentLevel: LEVEL_NAMES) {
	const response = await post(`${PATH}/chat`, { message, currentLevel });
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

async function setGptModel(model: string): Promise<ChatMessage | null> {
	const response = await post(`${PATH}/model`, { model });

	if (response.status !== 200) return null;

	const { chatInfoMessage } =
		(await response.json()) as ChatInfoMessageResponse;
	return makeChatMessageFromDTO(chatInfoMessage);
}

async function configureGptModel(
	configId: MODEL_CONFIG_ID,
	value: number
): Promise<ChatMessage | null> {
	const response = await post(`${PATH}/model/configure`, { configId, value });

	if (response.status !== 200) return null;

	const { chatInfoMessage } =
		(await response.json()) as ChatInfoMessageResponse;
	return makeChatMessageFromDTO(chatInfoMessage);
}

async function addInfoMessageToChatHistory(
	message: string,
	chatMessageType: CHAT_MESSAGE_TYPE,
	level: number
) {
	const response = await post(`${PATH}/addInfoToHistory`, {
		infoMessage: message,
		chatMessageType,
		level,
	});
	return response.status === 200;
}

export {
	sendMessage,
	configureGptModel,
	setGptModel,
	addInfoMessageToChatHistory,
	getChatMessagesFromDTOResponse,
	makeChatMessageFromDTO,
};
