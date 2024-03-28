import { DEFENCE_ID } from './defence';
import { EmailInfo } from './email';

type CHAT_MESSAGE_TYPE =
	| 'BOT'
	| 'BOT_BLOCKED'
	| 'GENERIC_INFO'
	| 'USER'
	| 'USER_TRANSFORMED'
	| 'LEVEL_COMPLETE'
	| 'DEFENCE_ALERTED'
	| 'DEFENCE_TRIGGERED'
	| 'SYSTEM'
	| 'FUNCTION_CALL'
	| 'ERROR_MSG'
	| 'RESET_LEVEL';

const chatModelIds = [
	'gpt-4-1106-preview',
	'gpt-4',
	'gpt-4-0613',
	'gpt-3.5-turbo',
	'gpt-3.5-turbo-0613',
	'gpt-3.5-turbo-16k',
	'gpt-3.5-turbo-16k-0613',
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

interface CustomChatModelConfiguration {
	id: MODEL_CONFIG_ID;
	name: string;
	info: string;
	value: number;
	min: number;
	max: number;
}

interface DefenceReport {
	blockedReason: string;
	isBlocked: boolean;
	alertedDefences: DEFENCE_ID[];
	triggeredDefences: DEFENCE_ID[];
}

interface ChatMessage {
	message: string;
	transformedMessage?: TransformedChatMessage;
	type: CHAT_MESSAGE_TYPE;
}

interface TransformedChatMessage {
	preMessage: string;
	message: string;
	postMessage: string;
	transformationName: string;
}

interface ChatResponse {
	reply: string;
	defenceReport: DefenceReport;
	transformedMessage?: TransformedChatMessage;
	wonLevel: boolean;
	isError: boolean;
	sentEmails: EmailInfo[];
	transformedMessageInfo?: string;
	wonLevelMessage?: ChatMessageDTO;
}

interface ChatCompletionRequestMessage {
	role: string;
	name: string | null;
	content: string;
}

interface ChatMessageDTO {
	completion: ChatCompletionRequestMessage | null;
	chatMessageType: CHAT_MESSAGE_TYPE;
	infoMessage: string | null | undefined;
	transformedMessage?: TransformedChatMessage;
}

export type {
	ChatMessage,
	ChatResponse,
	ChatMessageDTO,
	ChatModel,
	ChatModelConfigurations,
	CustomChatModelConfiguration,
	CHAT_MESSAGE_TYPE,
	MODEL_CONFIG_ID,
};
