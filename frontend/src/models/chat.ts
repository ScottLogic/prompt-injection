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

type ChatModel = {
	id: string;
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
