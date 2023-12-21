import { create } from 'domain';
import { DEFENCE_ID, DefenceConfigItem, Defence } from './models/defence';
import {
	promptEvalPrompt,
	qAPromptSecure,
	randomSequenceEnclosurePrompt,
	systemRoleDefault,
	xmlPrompt,
} from './promptTemplates';

function createDefence(id: DEFENCE_ID, config: DefenceConfigItem[]): Defence {
	return {
		id,
		config,
		isActive: false,
		isTriggered: false,
	};
}

const defaultDefences: Defence[] = [
	createDefence(DEFENCE_ID.CHARACTER_LIMIT, [
		{
			id: 'MAX_MESSAGE_LENGTH',
			value: String(280),
		},
	]),
	createDefence(DEFENCE_ID.PROMPT_EVALUATION_LLM, [
		{
			id: 'PROMPT',
			value: promptEvalPrompt,
		},
	]),
	createDefence(DEFENCE_ID.QA_LLM, [
		{
			id: 'PROMPT',
			value: qAPromptSecure,
		},
	]),
	createDefence(DEFENCE_ID.SYSTEM_ROLE, [
		{
			id: 'SYSTEM_ROLE',
			value: systemRoleDefault,
		},
	]),
	createDefence(DEFENCE_ID.XML_TAGGING, [
		{
			id: 'PROMPT',
			value: xmlPrompt,
		},
	]),
	createDefence(DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE, [
		{
			id: 'PROMPT',
			value: randomSequenceEnclosurePrompt,
		},
		{
			id: 'SEQUENCE_LENGTH',
			value: String(10),
		},
	]),
	createDefence(DEFENCE_ID.FILTER_USER_INPUT, [
		{
			id: 'FILTER_USER_INPUT',
			value: 'secret project,confidential project,budget,password',
		},
	]),
	createDefence(DEFENCE_ID.FILTER_BOT_OUTPUT, [
		{
			id: 'FILTER_BOT_OUTPUT',
			value: 'secret project',
		},
	]),
];

export { defaultDefences };
