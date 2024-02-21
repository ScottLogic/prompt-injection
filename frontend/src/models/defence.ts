enum DEFENCE_ID {
	CHARACTER_LIMIT = 'CHARACTER_LIMIT',
	PROMPT_EVALUATION_LLM = 'PROMPT_EVALUATION_LLM',
	QA_LLM = 'QA_LLM',
	SYSTEM_ROLE = 'SYSTEM_ROLE',
	XML_TAGGING = 'XML_TAGGING',
	RANDOM_SEQUENCE_ENCLOSURE = 'RANDOM_SEQUENCE_ENCLOSURE',
	INSTRUCTION = 'INSTRUCTION',
	INPUT_FILTERING = 'INPUT_FILTERING',
	OUTPUT_FILTERING = 'OUTPUT_FILTERING',
	PROMPT_ENCLOSURE = 'PROMPT_ENCLOSURE',
}

type DEFENCE_CONFIG_ITEM_ID =
	| 'MAX_MESSAGE_LENGTH'
	| 'PROMPT'
	| 'SYSTEM_ROLE'
	| 'SEQUENCE_LENGTH'
	| 'INPUT_FILTERING'
	| 'OUTPUT_FILTERING';

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
};

type DefenceDTO = {
	id: DEFENCE_ID;
	config: DefenceConfigItemDTO[];
	isActive: boolean;
};

type DefenceConfigItemDTO = {
	id: DEFENCE_CONFIG_ITEM_ID;
	value: string;
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
	DefenceDTO,
	DefenceConfigItemDTO,
};
