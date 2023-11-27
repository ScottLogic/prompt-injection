import { DEFENCE_ID, Defence } from './models/defence';
import {
	promptEvalPrompt,
	qAPromptSecure,
	systemRoleDefault,
	xmlPrompt,
} from './promptTemplates';

function createDefence(
	id: DEFENCE_ID,
	config: { id: string; value: string }[]
): Defence {
	const defenceConfig = config.map((item) => ({
		id: item.id,
		value: item.value,
	}));
	return new Defence(id, defenceConfig);
}

const defaultDefences: Defence[] = [
	createDefence(DEFENCE_ID.CHARACTER_LIMIT, [
		{
			id: 'maxMessageLength',
			value: String(280),
		},
	]),
	createDefence(DEFENCE_ID.PROMPT_EVALUATION_LLM, [
		{
			id: 'prompt',
			value: promptEvalPrompt,
		},
	]),
	createDefence(DEFENCE_ID.QA_LLM, [
		{
			id: 'prompt',
			value: qAPromptSecure,
		},
	]),
	createDefence(DEFENCE_ID.SYSTEM_ROLE, [
		{
			id: 'systemRole',
			value: systemRoleDefault,
		},
	]),
	createDefence(DEFENCE_ID.XML_TAGGING, [
		{
			id: 'prompt',
			value: xmlPrompt,
		},
	]),
	createDefence(DEFENCE_ID.FILTER_USER_INPUT, [
		{
			id: 'filterUserInput',
			value: 'secret project,confidential project,budget,password',
		},
	]),
	createDefence(DEFENCE_ID.FILTER_BOT_OUTPUT, [
		{
			id: 'filterBotOutput',
			value: 'secret project',
		},
	]),
];

export { defaultDefences };
