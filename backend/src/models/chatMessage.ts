import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';

import { CHAT_MESSAGE_TYPE, TransformedChatMessage } from './chat';

// 	BOT_BLOCKED,
// 	LEVEL_INFO,
// 	DEFENCE_ALERTED,
// 	DEFENCE_TRIGGERED,
// 	SYSTEM,
// 	FUNCTION_CALL,
// 	ERROR_MSG,
// 	RESET_LEVEL,

type ChatSystemMessage = {
	completion: ChatCompletionSystemMessageParam;
	chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM;
};

type ChatBotMessage = {
	completion: ChatCompletionAssistantMessageParam;
	chatMessageType: CHAT_MESSAGE_TYPE.BOT;
};

type ChatUserMessageAsCompletion = {
	completion: ChatCompletionUserMessageParam;
	chatMessageType: CHAT_MESSAGE_TYPE.USER;
};

type ChatUserMessageAsInfo = {
	chatMessageType: CHAT_MESSAGE_TYPE.USER;
	infoMessage: string;
};

type ChatUserMessage = ChatUserMessageAsCompletion | ChatUserMessageAsInfo;

type ChatInfoMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.INFO;
	infoMessage: string;
};

type ChatUserTransformedMessage = {
	completion: ChatCompletionUserMessageParam;
	chatMessageType: CHAT_MESSAGE_TYPE.USER_TRANSFORMED;
	transformedMessage: TransformedChatMessage;
};

type ChatMessage =
	| ChatUserTransformedMessage
	| ChatInfoMessage
	| ChatUserMessage
	| ChatBotMessage
	| ChatSystemMessage;

export type { ChatMessage, ChatSystemMessage };
