import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';

import { TransformedChatMessage } from './chat';

const chatInfoMessageTypes = [
	'DEFENCE_ALERTED',
	'DEFENCE_TRIGGERED',
	'LEVEL_INFO',
	'RESET_LEVEL',
	'ERROR_MSG',
	'BOT_BLOCKED',
	'USER',
	'GENERIC_INFO',
] as const;

type CHAT_INFO_MESSAGE_TYPES = (typeof chatInfoMessageTypes)[number];

type ChatInfoMessage = {
	chatMessageType: CHAT_INFO_MESSAGE_TYPES;
	infoMessage: string;
};

type ChatFunctionCallMessage = {
	completion: ChatCompletionMessageParam;
	chatMessageType: 'FUNCTION_CALL';
};

type ChatSystemMessage = {
	completion: ChatCompletionSystemMessageParam;
	chatMessageType: 'SYSTEM';
};

type ChatBotMessage = {
	completion: ChatCompletionAssistantMessageParam;
	chatMessageType: 'BOT';
};

type ChatUserMessageAsCompletion = {
	completion: ChatCompletionUserMessageParam;
	chatMessageType: 'USER';
};

type ChatUserTransformedMessage = {
	completion: ChatCompletionUserMessageParam;
	chatMessageType: 'USER_TRANSFORMED';
	transformedMessage: TransformedChatMessage;
};

type ChatCompletionMessage =
	| ChatFunctionCallMessage
	| ChatSystemMessage
	| ChatBotMessage
	| ChatUserMessageAsCompletion
	| ChatUserTransformedMessage;

type ChatMessage = ChatInfoMessage | ChatCompletionMessage;

export type {
	ChatMessage,
	ChatSystemMessage,
	ChatInfoMessage,
	CHAT_INFO_MESSAGE_TYPES,
};

export { chatInfoMessageTypes as chatInfoMessageType };
