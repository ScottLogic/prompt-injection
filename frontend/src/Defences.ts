import {
	DEFENCE_CONFIG_ITEM_ID,
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
} from './models/defence';

function makeDefence(
	id: DEFENCE_ID,
	name: string,
	info: string,
	config: DefenceConfigItem[]
): Defence {
	// each defence starts off as inactive and not triggered
	return { id, name, info, config, isActive: false };
}

function makeDefenceConfigItem(
	id: DEFENCE_CONFIG_ITEM_ID,
	name: string,
	inputType: 'text' | 'number'
): DefenceConfigItem {
	// value is empty by default
	return { id, name, inputType, value: '' };
}

const DEFAULT_DEFENCES: Defence[] = [
	makeDefence(
		DEFENCE_ID.CHARACTER_LIMIT,
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
		DEFENCE_ID.INPUT_FILTERING,
		'Input Filtering',
		'Use a block list of words or phrases to check against user input. If a match is found, the message is blocked.',
		[makeDefenceConfigItem('INPUT_FILTERING', 'filter list', 'text')]
	),
	makeDefence(
		DEFENCE_ID.OUTPUT_FILTERING,
		'Output Filtering',
		'Use a block list of words or phrases to check against bot output. If a match is found, the message is blocked.',
		[makeDefenceConfigItem('OUTPUT_FILTERING', 'filter list', 'text')]
	),
	makeDefence(
		DEFENCE_ID.XML_TAGGING,
		'XML Tagging',
		"Encloses the user's prompt between <user_input> tags and gives a pre-prompt for the bot to follow instructions. Escapes XML characters in raw input.",
		[makeDefenceConfigItem('PROMPT', 'pre-prompt', 'text')]
	),
	makeDefence(
		DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE,
		'Random Sequence Enclosure',
		"Encloses the user's prompt between random sequences of characters and gives a pre-prompt for the bot to follow instructions.",
		[
			makeDefenceConfigItem('PROMPT', 'pre-prompt', 'text'),
			makeDefenceConfigItem('SEQUENCE_LENGTH', 'sequence length', 'number'),
		]
	),
	makeDefence(
		DEFENCE_ID.INSTRUCTION,
		'Instruction Defence',
		'Adds a pre-prompt to the user input which encourages the bot to be careful about what comes next in the prompt.',
		[makeDefenceConfigItem('PROMPT', 'pre-prompt', 'text')]
	),
	makeDefence(
		DEFENCE_ID.PROMPT_ENCLOSURE,
		'Prompt Enclosure',
		"Alter the user's input by attaching instructional prompts and/or tags to the input.",
		[]
	),

	makeDefence(
		DEFENCE_ID.PROMPT_EVALUATION_LLM,
		'Prompt Evaluation LLM ',
		'Use an LLM to evaluate the user input for malicious content and prompt injection attacks.',
		[makeDefenceConfigItem('PROMPT', 'prompt', 'text')]
	),
	makeDefence(
		DEFENCE_ID.SYSTEM_ROLE,
		'System Role',
		'Tell the chat bot to follow a specific role.',
		[makeDefenceConfigItem('SYSTEM_ROLE', 'system role', 'text')]
	),
	makeDefence(
		DEFENCE_ID.QA_LLM,
		'Q/A LLM',
		'Currently the chatbot speaks to a separate Question/Answering LLM to retrieve information on documents. The QA LLM will reveal all information to the chatbot, who will then decide whether to reveal to the user. This defence adds an instructional prompt to the QA LLM to not reveal certain sensitive information to the chatbot.',
		[makeDefenceConfigItem('PROMPT', 'prompt', 'text')]
	),
];

const DEFENCES_HIDDEN_LEVEL3_IDS = [DEFENCE_ID.SYSTEM_ROLE, DEFENCE_ID.QA_LLM];

const MODEL_DEFENCES = [
	DEFENCE_ID.PROMPT_EVALUATION_LLM,
	DEFENCE_ID.QA_LLM,
	DEFENCE_ID.SYSTEM_ROLE,
];

const PROMPT_ENCLOSURE_DEFENCES = [
	DEFENCE_ID.XML_TAGGING,
	DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE,
	DEFENCE_ID.INSTRUCTION,
];

export {
	DEFAULT_DEFENCES,
	MODEL_DEFENCES,
	PROMPT_ENCLOSURE_DEFENCES,
	DEFENCES_HIDDEN_LEVEL3_IDS,
};
