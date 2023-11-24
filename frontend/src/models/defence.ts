enum DEFENCE_ID {
	CHARACTER_LIMIT = 'CHARACTER_LIMIT',
	EVALUATION_LLM_INSTRUCTIONS = 'EVALUATION_LLM_INSTRUCTIONS',
	QA_LLM_INSTRUCTIONS = 'QA_LLM_INSTRUCTIONS',
	SYSTEM_ROLE = 'SYSTEM_ROLE',
	XML_TAGGING = 'XML_TAGGING',
	FILTER_USER_INPUT = 'FILTER_USER_INPUT',
	FILTER_BOT_OUTPUT = 'FILTER_BOT_OUTPUT',
}

class DefenceConfigItem {
	constructor(id: string, name: string, inputType: 'text' | 'number') {
		this.id = id;
		this.inputType = inputType;
		this.name = name;
		this.value = '';
	}

	id: string;
	inputType: 'text' | 'number';
	name: string;
	value: string;
}

class Defence {
	constructor(
		id: DEFENCE_ID,
		name: string,
		info: string,
		config: DefenceConfigItem[]
	) {
		this.id = id;
		this.name = name;
		this.info = info;
		this.config = config;
		// each defence starts off as inactive and not triggered
		this.isActive = false;
		this.isTriggered = false;
	}

	id: DEFENCE_ID;
	name: string;
	info: string;
	config: DefenceConfigItem[];
	isActive: boolean;
	isTriggered: boolean;
}

interface DefenceResetResponse {
	id: string;
	value: string;
}

export { DEFENCE_ID, DefenceConfigItem, Defence };
export type { DefenceResetResponse };
