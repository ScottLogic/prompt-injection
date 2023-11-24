enum DEFENCE_ID {
	CHARACTER_LIMIT = 'CHARACTER_LIMIT',
	EVALUATION_LLM_INSTRUCTIONS = 'EVALUATION_LLM_INSTRUCTIONS',
	QA_LLM_INSTRUCTIONS = 'QA_LLM_INSTRUCTIONS',
	SYSTEM_ROLE = 'SYSTEM_ROLE',
	XML_TAGGING = 'XML_TAGGING',
	FILTER_USER_INPUT = 'FILTER_USER_INPUT',
	FILTER_BOT_OUTPUT = 'FILTER_BOT_OUTPUT',
}

interface DefenceConfigItem {
	id: string;
	value: string;
}

class Defence {
	constructor(id: DEFENCE_ID, config: DefenceConfigItem[]) {
		this.id = id;
		this.config = config;
		// each defence starts off as inactive and not triggered
		this.isActive = false;
		this.isTriggered = false;
	}

	id: DEFENCE_ID;
	config: DefenceConfigItem[];
	isActive: boolean;
	isTriggered: boolean;
}

export { DEFENCE_ID as DEFENCE_ID, Defence };
export type { DefenceConfigItem };
