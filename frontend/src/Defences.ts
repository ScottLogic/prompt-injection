import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from './models/defence';

const DEFENCE_DETAILS_LEVEL: DefenceInfo[] = [
	new DefenceInfo(
		DEFENCE_TYPES.CHARACTER_LIMIT,
		'Character Limit',
		'Limit the number of characters in the user input. This is a form of prompt validation.',
		[new DefenceConfig('maxMessageLength', 'max message length', 'number')]
	),
	new DefenceInfo(
		DEFENCE_TYPES.FILTER_USER_INPUT,
		'Input Filtering',
		'Use a block list of words or phrases to check against user input. If a match is found, the message is blocked.',
		[new DefenceConfig('filterUserInput', 'filter list', 'text')]
	),
	new DefenceInfo(
		DEFENCE_TYPES.FILTER_BOT_OUTPUT,
		'Output Filtering',
		'Use a block list of words or phrases to check against bot output. If a match is found, the message is blocked.',
		[new DefenceConfig('filterBotOutput', 'filter list', 'text')]
	),
	new DefenceInfo(
		DEFENCE_TYPES.XML_TAGGING,
		'XML Tagging',
		'Enclose the users prompt between <user_input> tags and escapes xml characters in raw input and provides instructional prompt to model to follow only enclosed instructions. This is a form of prompt validation.',
		[new DefenceConfig('prompt', 'prompt', 'text')]
	),
	new DefenceInfo(
		DEFENCE_TYPES.PROMPT_EVALUATION_LLM,
		'Prompt Evaluation LLM ',
		'Use an LLM to evaluate the user input for malicious content and prompt injection attacks.',
		[new DefenceConfig('prompt', 'prompt', 'text')]
	),
];

const DEFENCE_DETAILS_ALL: DefenceInfo[] = [
	...DEFENCE_DETAILS_LEVEL,
	new DefenceInfo(
		DEFENCE_TYPES.SYSTEM_ROLE,
		'System Role',
		'Tell the chat bot to follow a specific role.',
		[new DefenceConfig('systemRole', 'system role', 'text')]
	),
	new DefenceInfo(
		DEFENCE_TYPES.QA_LLM,
		'Q/A LLM',
		'Currently the chatbot speaks to a separate Question/Answering LLM to retrieve information on documents. The QA LLM will reveal all information to the chatbot, who will then decide whether to reveal to the user. This defence adds an instructional prompt to the QA LLM to not reveal certain sensitive information to the chatbot.',
		[new DefenceConfig('prompt', 'prompt', 'text')]
	),
];

export { DEFENCE_DETAILS_LEVEL, DEFENCE_DETAILS_ALL };
