import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { DEFENCE_ID } from './defence';
import { EmailInfo } from './email';

enum CHAT_MODELS {
	GPT_4_TURBO = 'gpt-4-1106-preview',
	GPT_4 = 'gpt-4',
	GPT_4_0613 = 'gpt-4-0613',
	GPT_3_5_TURBO = 'gpt-3.5-turbo',
	GPT_3_5_TURBO_0613 = 'gpt-3.5-turbo-0613',
	GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
	GPT_3_5_TURBO_16K_0613 = 'gpt-3.5-turbo-16k-0613',
}

enum CHAT_MESSAGE_TYPE {
	BOT,
	BOT_BLOCKED,
	INFO,
	USER,
	USER_TRANSFORMED,
	LEVEL_INFO,
	DEFENCE_ALERTED,
	DEFENCE_TRIGGERED,
	SYSTEM,
	FUNCTION_CALL,
	ERROR_MSG,
	RESET_LEVEL,
}

enum MODEL_CONFIG {
	TEMPERATURE = 'temperature',
	TOP_P = 'topP',
	FREQUENCY_PENALTY = 'frequencyPenalty',
	PRESENCE_PENALTY = 'presencePenalty',
}

interface ChatModel {
	id: CHAT_MODELS;
	configuration: ChatModelConfiguration;
}

interface ChatModelConfiguration {
	temperature: number;
	topP: number;
	frequencyPenalty: number;
	presencePenalty: number;
}

interface ChatDefenceReport {
	blockedReason: string | null;
	isBlocked: boolean;
	alertedDefences: DEFENCE_ID[];
	triggeredDefences: DEFENCE_ID[];
}

interface SingleDefenceReport {
	defence: DEFENCE_ID;
	blockedReason: string | null;
	status: 'alerted' | 'triggered' | 'ok';
}

interface ChatAnswer {
	reply: string;
	questionAnswered: boolean;
}

interface ChatMalicious {
	isMalicious: boolean;
	reason: string;
}

interface ChatResponse {
	completion: ChatCompletionMessageParam | null;
	defenceReport: ChatDefenceReport;
	wonLevel: boolean;
	openAIErrorMessage: string | null;
}

interface TransformedChatMessage {
	preMessage: string;
	message: string;
	postMessage: string;
	transformationName: string;
}

interface ChatHttpResponse {
	reply: string;
	defenceReport: ChatDefenceReport;
	transformedMessage?: TransformedChatMessage;
	wonLevel: boolean;
	isError: boolean;
	openAIErrorMessage: string | null;
	sentEmails: EmailInfo[];
}

interface ChatHistoryMessage {
	completion: ChatCompletionMessageParam | null;
	chatMessageType: CHAT_MESSAGE_TYPE;
	numTokens?: number | null;
	infoMessage?: string | null;
}

// default settings for chat model
const defaultChatModel: ChatModel = {
	id: CHAT_MODELS.GPT_3_5_TURBO,
	configuration: {
		temperature: 1,
		topP: 1,
		frequencyPenalty: 0,
		presencePenalty: 0,
	},
};

export type {
	ChatAnswer,
	ChatDefenceReport,
	ChatMalicious,
	ChatModel,
	ChatModelConfiguration,
	ChatResponse,
	ChatHttpResponse,
	ChatHistoryMessage,
	SingleDefenceReport,
	TransformedChatMessage,
};
export {
	CHAT_MODELS,
	CHAT_MESSAGE_TYPE,
	MODEL_CONFIG,
	defaultChatModel,
};
