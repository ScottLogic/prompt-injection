import { DEFENCE_ID, DefenceConfigItem, Defence } from './models/defence';

const DEFENCES_SHOWN_LEVEL3: Defence[] = [
	new Defence(
		DEFENCE_ID.CHARACTER_LIMIT,
		'Character Limit',
		'Limit the number of characters in the user input. This is a form of prompt validation.',
		[new DefenceConfigItem('maxMessageLength', 'max message length', 'number')]
	),
	new Defence(
		DEFENCE_ID.FILTER_USER_INPUT,
		'Input Filtering',
		'Use a block list of words or phrases to check against user input. If a match is found, the message is blocked.',
		[new DefenceConfigItem('filterUserInput', 'filter list', 'text')]
	),
	new Defence(
		DEFENCE_ID.FILTER_BOT_OUTPUT,
		'Output Filtering',
		'Use a block list of words or phrases to check against bot output. If a match is found, the message is blocked.',
		[new DefenceConfigItem('filterBotOutput', 'filter list', 'text')]
	),
	new Defence(
		DEFENCE_ID.XML_TAGGING,
		'XML Tagging',
		'Enclose the users prompt between <user_input> tags and escapes xml characters in raw input and provides instructional prompt to model to follow only enclosed instructions. This is a form of prompt validation.',
		[new DefenceConfigItem('prompt', 'prompt', 'text')]
	),
	new Defence(
		DEFENCE_ID.PROMPT_EVALUATION_LLM,
		'Prompt Evaluation LLM ',
		'Use an LLM to evaluate the user input for malicious content and prompt injection attacks.',
		[new DefenceConfigItem('prompt', 'prompt', 'text')]
	),
];

const DEFENCE_DETAILS_ALL: Defence[] = [
	...DEFENCES_SHOWN_LEVEL3,
	new Defence(
		DEFENCE_ID.SYSTEM_ROLE,
		'System Role',
		'Tell the chat bot to follow a specific role.',
		[new DefenceConfigItem('systemRole', 'system role', 'text')]
	),
	new Defence(
		DEFENCE_ID.QA_LLM,
		'Q/A LLM',
		'Currently the chatbot speaks to a separate Question/Answering LLM to retrieve information on documents. The QA LLM will reveal all information to the chatbot, who will then decide whether to reveal to the user. This defence adds an instructional prompt to the QA LLM to not reveal certain sensitive information to the chatbot.',
		[new DefenceConfigItem('prompt', 'prompt', 'text')]
	),
];

export { DEFENCES_SHOWN_LEVEL3 as DEFENCES_SHOWN_LEVEL3, DEFENCE_DETAILS_ALL };
