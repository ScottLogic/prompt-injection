import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

import { ChatMessage } from './chatMessage';
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

type ChatModel = {
	id: CHAT_MODELS;
	configuration: ChatModelConfiguration;
};

type ChatModelConfiguration = {
	temperature: number;
	topP: number;
	frequencyPenalty: number;
	presencePenalty: number;
};

// these must match the above type because they are used for indexing
const modelConfigIds = [
	'temperature',
	'topP',
	'frequencyPenalty',
	'presencePenalty',
] as const;

type MODEL_CONFIG_IDS = (typeof modelConfigIds)[number];

interface DefenceReport {
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

interface FunctionCallResponse {
	completion: ChatCompletionMessageParam;
	wonLevel: boolean;
	sentEmails: EmailInfo[];
}

interface ToolCallResponse {
	functionCallReply?: FunctionCallResponse;
	chatResponse?: ChatResponse;
	chatHistory: ChatMessage[];
}

interface ChatMalicious {
	isMalicious: boolean;
	reason: string;
}

interface ChatResponse {
	completion: ChatCompletionMessageParam | null;
	wonLevel: boolean;
	openAIErrorMessage: string | null;
}

interface ChatGptReply {
	chatHistory: ChatMessage[];
	completion: ChatCompletionAssistantMessageParam | null;
	openAIErrorMessage: string | null;
}

interface TransformedChatMessage {
	preMessage: string;
	message: string;
	postMessage: string;
	transformationName: string;
}

interface MessageTransformation {
	transformedMessage: TransformedChatMessage;
	transformedMessageInfo: string;
	transformedMessageCombined: string;
}

interface ChatHttpResponse {
	reply: string;
	defenceReport: DefenceReport;
	transformedMessage?: TransformedChatMessage;
	wonLevel: boolean;
	isError: boolean;
	openAIErrorMessage: string | null;
	sentEmails: EmailInfo[];
	transformedMessageInfo?: string;
}

interface LevelHandlerResponse {
	chatResponse: ChatHttpResponse;
	chatHistory: ChatMessage[];
}

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
	DefenceReport,
	ChatGptReply,
	ChatMalicious,
	ChatModel,
	ChatModelConfiguration,
	ChatResponse,
	LevelHandlerResponse,
	ChatHttpResponse,
	TransformedChatMessage,
	FunctionCallResponse,
	ToolCallResponse,
	MessageTransformation,
	SingleDefenceReport,
	MODEL_CONFIG_IDS,
};
export { CHAT_MODELS, defaultChatModel, modelConfigIds };
