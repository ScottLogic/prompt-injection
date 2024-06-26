import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

import { ChatInfoMessage, ChatMessage } from './chatMessage';
import { DEFENCE_ID } from './defence';
import { EmailInfo } from './email';

const chatModelIds = [
	'gpt-4-1106-preview',
	'gpt-4',
	'gpt-4-0613',
	'gpt-3.5-turbo',
] as const;

type CHAT_MODEL_ID = (typeof chatModelIds)[number];

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
export { defaultChatModel, modelConfigIds, chatModelIds };
export type { CHAT_MODEL_ID };
