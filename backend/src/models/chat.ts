import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

import { ChatInfoMessage, ChatMessage } from './chatMessage';
import { DEFENCE_ID } from './defence';
import { EmailInfo } from './email';

// Size of each model's context window in number of tokens
// https://platform.openai.com/docs/models
const chatModelContextWindow = {
	'gpt-4o': 128000,
	'gpt-4-turbo': 128000,
	'gpt-4': 8192,
	'gpt-3.5-turbo': 16385,
} as const;

type CHAT_MODEL_ID = keyof typeof chatModelContextWindow;

const chatModelIds = Object.freeze(
	Object.keys(chatModelContextWindow)
) as readonly [CHAT_MODEL_ID];

type ChatModel = {
	id: CHAT_MODEL_ID;
	configuration: ChatModelConfigurations;
};

const modelConfigIds = [
	'temperature',
	'topP',
	'frequencyPenalty',
	'presencePenalty',
] as const;

type MODEL_CONFIG_ID = (typeof modelConfigIds)[number];

type ChatModelConfigurations = {
	[key in MODEL_CONFIG_ID]: number;
};

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
	sentEmails: EmailInfo[];
}

interface ToolCallResponse {
	chatHistory: ChatMessage[];
	sentEmails: EmailInfo[];
}

type ChatModelReply = {
	completion: ChatCompletionAssistantMessageParam | null;
	openAIErrorMessage: string | null;
};

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
	wonLevelMessage?: ChatInfoMessage;
}

interface LevelHandlerResponse {
	chatResponse: ChatHttpResponse;
	chatHistory: ChatMessage[];
}

const defaultChatModel: ChatModel = {
	id: 'gpt-3.5-turbo',
	configuration: {
		temperature: 1,
		topP: 1,
		frequencyPenalty: 0,
		presencePenalty: 0,
	},
};

export type {
	CHAT_MODEL_ID,
	DefenceReport,
	ChatModel,
	ChatModelConfigurations,
	ChatModelReply,
	LevelHandlerResponse,
	ChatHttpResponse,
	TransformedChatMessage,
	FunctionCallResponse,
	ToolCallResponse,
	MessageTransformation,
	SingleDefenceReport,
	MODEL_CONFIG_ID,
};
export {
	defaultChatModel,
	modelConfigIds,
	chatModelIds,
	chatModelContextWindow,
};
