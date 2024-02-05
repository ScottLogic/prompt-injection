import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';

import { TransformedChatMessage } from './chat';

const chatMessageTypesAsInfo = [
	'DEFENCE_ALERTED',
	'DEFENCE_TRIGGERED',
	'LEVEL_INFO',
	'RESET_LEVEL',
	'ERROR_MSG',
	'BOT_BLOCKED',
	'USER',
	'INFO',
] as const;

type CHAT_MESSAGE_TYPE_AS_INFO = (typeof chatMessageTypesAsInfo)[number];

type CHAT_MESSAGE_TYPE = CHAT_MESSAGE_TYPE_AS_INFO;

type ChatMessageAsInfo = {
	chatMessageType: CHAT_MESSAGE_TYPE_AS_INFO;
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

type ChatMessage =
	| ChatMessageAsInfo
	| ChatUserTransformedMessage
	| ChatFunctionCallMessage
	| ChatBotMessage
	| ChatSystemMessage
	| ChatUserMessageAsCompletion;

export type {
	ChatMessage,
	ChatSystemMessage,
	ChatMessageAsInfo,
	CHAT_MESSAGE_TYPE,
	CHAT_MESSAGE_TYPE_AS_INFO,
};

export { chatMessageTypesAsInfo };
