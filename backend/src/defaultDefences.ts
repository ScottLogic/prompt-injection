import { DEFENCE_ID, Defence } from './models/defence';
import {
	promptEvalPrompt,
	qAPromptSecure,
	systemRoleDefault,
	xmlPrompt,
} from './promptTemplates';

function createDefenceInfo(
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
	createDefenceInfo(DEFENCE_ID.CHARACTER_LIMIT, [
		{
			id: 'maxMessageLength',
			value: String(280),
		},
	]),
	createDefenceInfo(DEFENCE_ID.PROMPT_EVALUATION_LLM, [
		{
			id: 'prompt',
			value: promptEvalPrompt,
		},
	]),
	createDefenceInfo(DEFENCE_ID.QA_LLM, [
		{
			id: 'prompt',
			value: qAPromptSecure,
		},
	]),
	createDefenceInfo(DEFENCE_ID.SYSTEM_ROLE, [
		{
			id: 'systemRole',
			value: systemRoleDefault,
		},
	]),
	createDefenceInfo(DEFENCE_ID.XML_TAGGING, [
		{
			id: 'prompt',
			value: xmlPrompt,
		},
	]),
	createDefenceInfo(DEFENCE_ID.FILTER_USER_INPUT, [
		{
			id: 'filterUserInput',
			value: 'secret project,confidential project,budget,password',
		},
	]),
	createDefenceInfo(DEFENCE_ID.FILTER_BOT_OUTPUT, [
		{
			id: 'filterBotOutput',
			value: 'secret project',
		},
	]),
];

export { defaultDefences };
