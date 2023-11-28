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
	value: string;
}

interface DefenceInfo {
	id: DEFENCE_TYPES;
	config: DefenceConfig[];
	isActive: boolean;
	isTriggered: boolean;
}

export { DEFENCE_TYPES };
export type { DefenceInfo, DefenceConfig, DEFENCE_CONFIG_ITEM_ID };
