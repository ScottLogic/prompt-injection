enum DEFENCE_ID {
	CHARACTER_LIMIT = 'CHARACTER_LIMIT',
	PROMPT_EVALUATION_LLM = 'PROMPT_EVALUATION_LLM',
	QA_LLM = 'QA_LLM',
	SYSTEM_ROLE = 'SYSTEM_ROLE',
	XML_TAGGING = 'XML_TAGGING',
	RANDOM_SEQUENCE_ENCLOSURE = 'RANDOM_SEQUENCE_ENCLOSURE',
	FILTER_USER_INPUT = 'FILTER_USER_INPUT',
	FILTER_BOT_OUTPUT = 'FILTER_BOT_OUTPUT',
}

type DEFENCE_CONFIG_ITEM_ID =
	| 'MAX_MESSAGE_LENGTH'
	| 'PROMPT'
	| 'SYSTEM_ROLE'
	| 'SEQUENCE_LENGTH'
	| 'FILTER_USER_INPUT'
	| 'FILTER_BOT_OUTPUT';

type DefenceConfigItem = {
	id: DEFENCE_CONFIG_ITEM_ID;
	inputType: 'text' | 'number';
	name: string;
	value: string;
};

type Defence = {
	id: DEFENCE_ID;
	name: string;
	info: string;
	config: DefenceConfigItem[];
	isActive: boolean;
	isTriggered: boolean;
};

type DefenceResetResponse = {
	id: string;
	value: string;
};

export { DEFENCE_ID };
export type {
	DefenceResetResponse,
	DEFENCE_CONFIG_ITEM_ID,
	DefenceConfigItem,
	Defence,
};
