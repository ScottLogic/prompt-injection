import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from './models/defence';
import {
	promptEvalPrompt,
	qAPromptSecure,
	systemRoleDefault,
	xmlPrompt,
} from './promptTemplates';

function createDefenceInfo(
	id: DEFENCE_TYPES,
	config: DefenceConfig[]
): DefenceInfo {
	return {
		id,
		config,
		isActive: false,
		isTriggered: false,
	};
}

const defaultDefences: DefenceInfo[] = [
	createDefenceInfo(DEFENCE_TYPES.CHARACTER_LIMIT, [
		{
			id: 'MAX_MESSAGE_LENGTH',
			value: String(280),
		},
	]),
	createDefenceInfo(DEFENCE_TYPES.PROMPT_EVALUATION_LLM, [
		{
			id: 'PROMPT',
			value: promptEvalPrompt,
		},
	]),
	createDefenceInfo(DEFENCE_TYPES.QA_LLM, [
		{
			id: 'PROMPT',
			value: qAPromptSecure,
		},
	]),
	createDefenceInfo(DEFENCE_TYPES.SYSTEM_ROLE, [
		{
			id: 'SYSTEM_ROLE',
			value: systemRoleDefault,
		},
	]),
	createDefenceInfo(DEFENCE_TYPES.XML_TAGGING, [
		{
			id: 'PROMPT',
			value: xmlPrompt,
		},
	]),
	createDefenceInfo(DEFENCE_TYPES.FILTER_USER_INPUT, [
		{
			id: 'FILTER_USER_INPUT',
			value: 'secret project,confidential project,budget,password',
		},
	]),
	createDefenceInfo(DEFENCE_TYPES.FILTER_BOT_OUTPUT, [
		{
			id: 'FILTER_BOT_OUTPUT',
			value: 'secret project',
		},
	]),
];

export { defaultDefences };
