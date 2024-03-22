import { DEFENCE_ID } from './defence';
import { EmailInfo } from './email';

type CHAT_MESSAGE_TYPE =
	| 'BOT'
	| 'BOT_BLOCKED'
	| 'GENERIC_INFO'
	| 'USER'
	| 'USER_TRANSFORMED'
	| 'LEVEL_INFO'
	| 'DEFENCE_ALERTED'
	| 'DEFENCE_TRIGGERED'
	| 'SYSTEM'
	| 'FUNCTION_CALL'
	| 'ERROR_MSG'
	| 'RESET_LEVEL';

type ChatModel = {
	id: string;
	configuration: ChatModelConfigurations;
};

type ChatModelConfigurations = {
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

type MODEL_CONFIG_ID = (typeof modelConfigIds)[number];

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
