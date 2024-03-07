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
	value: string;
};

type QaLlmDefence = {
	id: DEFENCE_ID.QA_LLM;
	config: DefenceConfigItem[];
	isActive: boolean;
};

type Defence =
	| {
			id: DEFENCE_ID;
			config: DefenceConfigItem[];
			isActive: boolean;
	  }
	| QaLlmDefence;

export { DEFENCE_ID };
export type {
	Defence,
	DefenceConfigItem,
	DEFENCE_CONFIG_ITEM_ID,
	QaLlmDefence,
};
