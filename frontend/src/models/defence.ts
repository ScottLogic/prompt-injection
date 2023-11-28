enum DEFENCE_TYPES {
	CHARACTER_LIMIT = 'CHARACTER_LIMIT',
	PROMPT_EVALUATION_LLM = 'PROMPT_EVALUATION_LLM',
	QA_LLM = 'QA_LLM',
	SYSTEM_ROLE = 'SYSTEM_ROLE',
	XML_TAGGING = 'XML_TAGGING',
	FILTER_USER_INPUT = 'FILTER_USER_INPUT',
	FILTER_BOT_OUTPUT = 'FILTER_BOT_OUTPUT',
}

type DEFENCE_CONFIG_ITEM_ID =
	| 'MAX_MESSAGE_LENGTH'
	| 'PROMPT'
	| 'SYSTEM_ROLE'
	| 'FILTER_USER_INPUT'
	| 'FILTER_BOT_OUTPUT';

interface DefenceConfig {
	id: DEFENCE_CONFIG_ITEM_ID;
	inputType: 'text' | 'number';
	name: string;
	value: string;
}

interface DefenceInfo {
	id: DEFENCE_TYPES;
	name: string;
	info: string;
	config: DefenceConfig[];
	isActive: boolean;
	isTriggered: boolean;
}

interface DefenceResetResponse {
	id: string;
	value: string;
}

export { DEFENCE_TYPES };
export type {
	DefenceResetResponse,
	DEFENCE_CONFIG_ITEM_ID,
	DefenceConfig,
	DefenceInfo,
};
