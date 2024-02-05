import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';

import { TransformedChatMessage } from './chat';

type CHAT_MESSAGE_TYPE =
	| 'BOT'
	| 'BOT_BLOCKED'
	| 'INFO'
	| 'USER'
	| 'USER_TRANSFORMED'
	| 'LEVEL_INFO'
	| 'DEFENCE_ALERTED'
	| 'DEFENCE_TRIGGERED'
	| 'SYSTEM'
	| 'FUNCTION_CALL'
	| 'ERROR_MSG'
	| 'RESET_LEVEL';

type ChatDefenceAlertedMessage = {
	chatMessageType: 'DEFENCE_ALERTED';
	infoMessage: string;
};

type ChatDefenceTriggeredMessage = {
	chatMessageType: 'DEFENCE_TRIGGERED';
	infoMessage: string;
};

type ChatLevelInfoMessage = {
	chatMessageType: 'LEVEL_INFO';
	infoMessage: string;
};

type ChatResetLevelMessage = {
	chatMessageType: 'RESET_LEVEL';
	infoMessage: string;
};

type ChatErrorMessage = {
	chatMessageType: 'ERROR_MSG';
	infoMessage: string;
};

type ChatBotBlockedMessage = {
	chatMessageType: 'BOT_BLOCKED';
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

type ChatUserMessageAsInfo = {
	chatMessageType: 'USER';
	infoMessage: string;
};

type ChatUserMessage = ChatUserMessageAsCompletion | ChatUserMessageAsInfo;

type ChatInfoMessage = {
	chatMessageType: 'INFO';
	infoMessage: string;
};

type ChatUserTransformedMessage = {
	completion: ChatCompletionUserMessageParam;
	chatMessageType: 'USER_TRANSFORMED';
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

export type { ChatMessage, ChatSystemMessage, CHAT_MESSAGE_TYPE };
