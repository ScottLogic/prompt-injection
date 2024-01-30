import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';

import { CHAT_MESSAGE_TYPE, TransformedChatMessage } from './chat';

type ChatDefenceAlertedMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.DEFENCE_ALERTED;
	infoMessage: string;
};

type ChatDefenceTriggeredMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED;
	infoMessage: string;
};

type ChatLevelInfoMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.LEVEL_INFO;
	infoMessage: string;
};

type ChatResetLevelMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.RESET_LEVEL;
	infoMessage: string;
};

type ChatErrorMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG;
	infoMessage: string;
};

type ChatBotBlockedMessage = {
	chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED;
	infoMessage: string;
};

type ChatFunctionCallMessage = {
	completion: ChatCompletionMessageParam;
	chatMessageType: CHAT_MESSAGE_TYPE.FUNCTION_CALL;
};

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
	| ChatErrorMessage
	| ChatBotBlockedMessage
	| ChatFunctionCallMessage
	| ChatInfoMessage
	| ChatUserMessage
	| ChatDefenceTriggeredMessage
	| ChatResetLevelMessage
	| ChatDefenceAlertedMessage
	| ChatBotMessage
	| ChatLevelInfoMessage
	| ChatSystemMessage;

export type { ChatMessage, ChatSystemMessage };
