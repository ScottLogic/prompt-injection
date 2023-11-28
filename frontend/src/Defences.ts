import {
	DEFENCE_CONFIG_ITEM_ID,
	DEFENCE_TYPES,
	DefenceConfig,
	DefenceInfo,
} from './models/defence';

function makeDefence(
	id: DEFENCE_TYPES,
	name: string,
	info: string,
	config: DefenceConfig[]
): DefenceInfo {
	// each defence starts off as inactive and not triggered
	return { id, name, info, config, isActive: false, isTriggered: false };
}

function makeDefenceConfigItem(
	id: DEFENCE_CONFIG_ITEM_ID,
	name: string,
	inputType: 'text' | 'number'
): DefenceConfig {
	// value is empty by default
	return { id, name, inputType, value: '' };
}

const DEFENCE_DETAILS_LEVEL: DefenceInfo[] = [
	makeDefence(
		DEFENCE_TYPES.CHARACTER_LIMIT,
		'Character Limit',
		'Limit the number of characters in the user input. This is a form of prompt validation.',
		[
			makeDefenceConfigItem(
				'MAX_MESSAGE_LENGTH',
				'max message length',
				'number'
			),
		]
	),
	makeDefence(
		DEFENCE_TYPES.FILTER_USER_INPUT,
		'Input Filtering',
		'Use a block list of words or phrases to check against user input. If a match is found, the message is blocked.',
		[makeDefenceConfigItem('FILTER_USER_INPUT', 'filter list', 'text')]
	),
	makeDefence(
		DEFENCE_TYPES.FILTER_BOT_OUTPUT,
		'Output Filtering',
		'Use a block list of words or phrases to check against bot output. If a match is found, the message is blocked.',
		[makeDefenceConfigItem('FILTER_BOT_OUTPUT', 'filter list', 'text')]
	),
	makeDefence(
		DEFENCE_TYPES.XML_TAGGING,
		'XML Tagging',
		'Enclose the users prompt between <user_input> tags and escapes xml characters in raw input and provides instructional prompt to model to follow only enclosed instructions. This is a form of prompt validation.',
		[makeDefenceConfigItem('PROMPT', 'prompt', 'text')]
	),
	makeDefence(
		DEFENCE_TYPES.PROMPT_EVALUATION_LLM,
		'Prompt Evaluation LLM ',
		'Use an LLM to evaluate the user input for malicious content and prompt injection attacks.',
		[makeDefenceConfigItem('PROMPT', 'prompt', 'text')]
	),
];

const DEFENCE_DETAILS_ALL: DefenceInfo[] = [
	...DEFENCE_DETAILS_LEVEL,
	makeDefence(
		DEFENCE_TYPES.SYSTEM_ROLE,
		'System Role',
		'Tell the chat bot to follow a specific role.',
		[makeDefenceConfigItem('SYSTEM_ROLE', 'system role', 'text')]
	),
	makeDefence(
		DEFENCE_TYPES.QA_LLM,
		'Q/A LLM',
		'Currently the chatbot speaks to a separate Question/Answering LLM to retrieve information on documents. The QA LLM will reveal all information to the chatbot, who will then decide whether to reveal to the user. This defence adds an instructional prompt to the QA LLM to not reveal certain sensitive information to the chatbot.',
		[makeDefenceConfigItem('PROMPT', 'prompt', 'text')]
	),
];

export { DEFENCE_DETAILS_LEVEL, DEFENCE_DETAILS_ALL };
