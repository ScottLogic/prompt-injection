import { jest, beforeEach, test, expect } from '@jest/globals';

import { defaultDefences } from '@src/defaultDefences';
import {
	activateDefence,
	configureDefence,
	deactivateDefence,
	resetDefenceConfig,
	detectTriggeredInputDefences,
	getQAPromptFromConfig,
	getSystemRole,
	isDefenceActive,
	detectTriggeredOutputDefences,
} from '@src/defence';
import * as langchain from '@src/langchain';
import { DEFENCE_ID, DefenceConfigItem } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';
import {
	promptEvalPrompt,
	qAPromptSecure,
	systemRoleDefault,
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from '@src/promptTemplates';

jest.mock('@src/langchain');

beforeEach(() => {
	jest
		.mocked(langchain.queryPromptEvaluationModel)
		.mockResolvedValue({ isMalicious: false });
});

const botOutputFilterTriggeredResponse =
	'My original response was blocked as it contained a restricted word/phrase. Ask me something else. ';

test('GIVEN defence is not active WHEN activating defence THEN defence is active', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	const defences = defaultDefences;
	const updatedActiveDefences = activateDefence(defence, defences);
	expect(isDefenceActive(defence, updatedActiveDefences)).toBe(true);
});

test('GIVEN defence is active WHEN activating defence THEN defence is active', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	const defences = defaultDefences;
	const updatedActiveDefences = activateDefence(defence, defences);
	expect(isDefenceActive(defence, updatedActiveDefences)).toBe(true);
});

test('GIVEN defence is active WHEN deactivating defence THEN defence is not active', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	const defences = defaultDefences;
	activateDefence(defence, defences);
	const updatedActiveDefences = deactivateDefence(defence, defences);
	expect(updatedActiveDefences).not.toContain(defence);
});

test('GIVEN defence is not active WHEN deactivating defence THEN defence is not active', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	const defences = defaultDefences;
	const updatedActiveDefences = deactivateDefence(defence, defences);
	expect(updatedActiveDefences).not.toContain(defence);
});

test('GIVEN defence is active WHEN checking if defence is active THEN return true', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	const defences = defaultDefences;
	const updatedDefences = activateDefence(defence, defences);
	const isActive = isDefenceActive(defence, updatedDefences);
	expect(isActive).toBe(true);
});

test('GIVEN defence is not active WHEN checking if defence is active THEN return false', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	const defences = defaultDefences;
	const isActive = isDefenceActive(defence, defences);
	expect(isActive).toBe(false);
});

test('GIVEN no defences are active WHEN detecting triggered defences THEN no defences are triggered', async () => {
	const message = 'Hello';
	const defences = defaultDefences;
	const defenceReport = await detectTriggeredInputDefences(message, defences);
	expect(defenceReport.blockedReason).toBe(null);
	expect(defenceReport.isBlocked).toBe(false);
	expect(defenceReport.triggeredDefences.length).toBe(0);
});

test(
	'GIVEN CHARACTER_LIMIT defence is active AND message is too long ' +
		'WHEN detecting triggered defences ' +
		'THEN CHARACTER_LIMIT defence is triggered AND the message is blocked',
	async () => {
		const message = 'Hello';
		// activate and configure CHARACTER_LIMIT defence
		const defences = configureDefence(
			DEFENCE_ID.CHARACTER_LIMIT,
			activateDefence(DEFENCE_ID.CHARACTER_LIMIT, defaultDefences),
			[{ id: 'MAX_MESSAGE_LENGTH', value: '3' }]
		);
		const defenceReport = await detectTriggeredInputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(
			'Message Blocked: Input exceeded character limit.'
		);
		expect(defenceReport.isBlocked).toBe(true);
		expect(defenceReport.triggeredDefences).toContain(
			DEFENCE_ID.CHARACTER_LIMIT
		);
	}
);

test(
	'GIVEN CHARACTER_LIMIT defence is active AND message is not too long ' +
		'WHEN detecting triggered defences ' +
		'THEN CHARACTER_LIMIT defence is not triggered AND the message is not blocked',
	async () => {
		const message = 'Hello';
		// activate and configure CHARACTER_LIMIT defence
		const defences = configureDefence(
			DEFENCE_ID.CHARACTER_LIMIT,
			activateDefence(DEFENCE_ID.CHARACTER_LIMIT, defaultDefences),
			[{ id: 'MAX_MESSAGE_LENGTH', value: '280' }]
		);
		const defenceReport = await detectTriggeredInputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(null);
		expect(defenceReport.isBlocked).toBe(false);
		expect(defenceReport.triggeredDefences.length).toBe(0);
	}
);

test(
	'GIVEN CHARACTER_LIMIT defence is not active AND message is too long ' +
		'WHEN detecting triggered defences ' +
		'THEN CHARACTER_LIMIT defence is alerted AND the message is not blocked',
	async () => {
		const message = 'Hello';
		// configure CHARACTER_LIMIT defence
		const defences = configureDefence(
			DEFENCE_ID.CHARACTER_LIMIT,
			defaultDefences,
			[
				{
					id: 'MAX_MESSAGE_LENGTH',
					value: '3',
				},
			]
		);
		const defenceReport = await detectTriggeredInputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(null);
		expect(defenceReport.isBlocked).toBe(false);
		expect(defenceReport.alertedDefences).toContain(DEFENCE_ID.CHARACTER_LIMIT);
	}
);

test('GIVEN user configures random sequence enclosure WHEN configuring defence THEN defence is configured', () => {
	const defence = DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE;
	const newPrompt = 'new pre prompt';
	const newLength = String(100);
	const config: DefenceConfigItem[] = [
		{
			id: 'PROMPT',
			value: newPrompt,
		},
		{
			id: 'SEQUENCE_LENGTH',
			value: newLength,
		},
	];

	// configure RSE length
	const defences = configureDefence(
		DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE,
		defaultDefences,
		config
	);
	// expect the RSE length to be updated
	const matchingDefence = defences.find((d) => d.id === defence);
	expect(matchingDefence).toBeTruthy();
	if (matchingDefence) {
		let matchingDefenceConfig = matchingDefence.config.find(
			(c) => c.id === config[0].id
		);
		expect(matchingDefenceConfig).toBeTruthy();
		if (matchingDefenceConfig) {
			expect(matchingDefenceConfig.value).toBe(config[0].value);
		}
		matchingDefenceConfig = matchingDefence.config.find(
			(c) => c.id === config[1].id
		);
		expect(matchingDefenceConfig).toBeTruthy();
		if (matchingDefenceConfig) {
			expect(matchingDefenceConfig.value).toBe(config[1].value);
		}
	}
});

test('GIVEN XML_TAGGING defence is active AND message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is triggered', async () => {
	const message = '<Hello>';
	// activate XML_TAGGING defence
	const defences = activateDefence(DEFENCE_ID.XML_TAGGING, defaultDefences);
	const defenceReport = await detectTriggeredInputDefences(message, defences);
	expect(defenceReport.blockedReason).toBe(null);
	expect(defenceReport.isBlocked).toBe(false);
	expect(defenceReport.triggeredDefences).toContain(DEFENCE_ID.XML_TAGGING);
});

test('GIVEN XML_TAGGING defence is inactive AND message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is alerted', async () => {
	const message = '<Hello>';
	const defences = defaultDefences;
	const defenceReport = await detectTriggeredInputDefences(message, defences);
	expect(defenceReport.blockedReason).toBe(null);
	expect(defenceReport.isBlocked).toBe(false);
	expect(defenceReport.alertedDefences).toContain(DEFENCE_ID.XML_TAGGING);
});

test('GIVEN setting max message length WHEN configuring defence THEN defence is configured', () => {
	const defence = DEFENCE_ID.CHARACTER_LIMIT;
	// configure CHARACTER_LIMIT defence
	const config: DefenceConfigItem = {
		id: 'MAX_MESSAGE_LENGTH',
		value: '10',
	};
	const defences = configureDefence(defence, defaultDefences, [config]);
	const matchingDefence = defences.find((d) => d.id === defence);
	expect(matchingDefence).toBeDefined();
	const matchingDefenceConfig = matchingDefence?.config.find(
		(c) => c.id === config.id
	);
	expect(matchingDefenceConfig).toBeDefined();
	expect(matchingDefenceConfig?.value).toBe(config.value);
});

test('GIVEN system role has not been configured WHEN getting system role THEN return default system role', () => {
	const defences = defaultDefences;
	const systemRole = getSystemRole(defences);
	expect(systemRole).toBe(systemRoleDefault);
});

test('GIVEN system role has been configured WHEN getting system role THEN return system role', () => {
	const defences = defaultDefences;
	const systemRole = getSystemRole(defences);
	expect(systemRole).toBe(systemRoleDefault);
});

test('GIVEN a new system role has been set WHEN getting system role THEN return new system role', () => {
	const initialDefences = defaultDefences;
	let systemRole = getSystemRole(initialDefences);
	expect(systemRole).toBe(systemRoleDefault);

	const defencesWithSystemRole = configureDefence(
		DEFENCE_ID.SYSTEM_ROLE,
		initialDefences,
		[{ id: 'SYSTEM_ROLE', value: 'new system role' }]
	);
	systemRole = getSystemRole(defencesWithSystemRole);
	expect(systemRole).toBe('new system role');
});

test('GIVEN system roles have been set for each level WHEN getting system roles THEN the right system role is returned per level', () => {
	const defences = defaultDefences;
	const systemRole_Level1 = getSystemRole(defences, LEVEL_NAMES.LEVEL_1);
	const systemRole_Level2 = getSystemRole(defences, LEVEL_NAMES.LEVEL_2);
	const systemRole_Level3 = getSystemRole(defences, LEVEL_NAMES.LEVEL_3);
	expect(systemRole_Level1).toBe(systemRoleLevel1);
	expect(systemRole_Level2).toBe(systemRoleLevel2);
	expect(systemRole_Level3).toBe(systemRoleLevel3);
});

test('GIVEN the QA LLM prompt has not been configured WHEN getting QA LLM configuration THEN return default secure prompt', () => {
	const defences = defaultDefences;
	const qaLlmPrompt = getQAPromptFromConfig(defences);
	expect(qaLlmPrompt).toBe(qAPromptSecure);
});

test('GIVEN the QA LLM prompt has been configured WHEN getting QA LLM configuration THEN return configured prompt', () => {
	const newQaLlmPrompt = 'new QA LLM prompt';
	const defences = configureDefence(DEFENCE_ID.QA_LLM, defaultDefences, [
		{ id: 'PROMPT', value: newQaLlmPrompt },
	]);
	const qaLlmPrompt = getQAPromptFromConfig(defences);
	expect(qaLlmPrompt).toBe(newQaLlmPrompt);
});

test('GIVEN the prompt evaluation LLM prompt has not been configured WHEN detecting triggered defences THEN the default evaluator prompt is used', async () => {
	const message = 'Hello';
	const defences = activateDefence(
		DEFENCE_ID.PROMPT_EVALUATION_LLM,
		defaultDefences
	);
	await detectTriggeredInputDefences(message, defences);

	expect(langchain.queryPromptEvaluationModel).toHaveBeenCalledWith(
		message,
		promptEvalPrompt
	);
});

test('GIVEN the prompt evaluation LLM prompt has been configured WHEN detecting triggered defences THEN the configured evaluator prompt is used', async () => {
	const message = 'Hello';
	const newPromptEvalPrompt = 'new prompt eval prompt';
	const defences = configureDefence(
		DEFENCE_ID.PROMPT_EVALUATION_LLM,
		activateDefence(DEFENCE_ID.PROMPT_EVALUATION_LLM, defaultDefences),
		[
			{
				id: 'PROMPT',
				value: newPromptEvalPrompt,
			},
		]
	);
	await detectTriggeredInputDefences(message, defences);

	expect(langchain.queryPromptEvaluationModel).toHaveBeenCalledWith(
		message,
		newPromptEvalPrompt
	);
});

test('GIVEN user has configured defence WHEN resetting defence config THEN defence config is reset', () => {
	const defence = DEFENCE_ID.SYSTEM_ROLE;
	let defences = defaultDefences;

	// configure defence
	const config: DefenceConfigItem[] = [
		{
			id: 'SYSTEM_ROLE',
			value: 'new system role',
		},
	];
	defences = configureDefence(defence, defences, config);
	// reset defence config
	defences = resetDefenceConfig(
		DEFENCE_ID.SYSTEM_ROLE,
		'SYSTEM_ROLE',
		defences
	);
	// expect defence config to be reset
	const matchingDefence = defences.find((d) => d.id === defence);
	expect(matchingDefence).toBeTruthy();
	expect(matchingDefence?.config[0].value).toBe(systemRoleDefault);
});

test('GIVEN user has configured two defence WHEN resetting one defence config THEN that defence config is reset and the other stays same', () => {
	let defences = defaultDefences;
	// configure defence
	const sysRoleConfig: DefenceConfigItem[] = [
		{
			id: 'SYSTEM_ROLE',
			value: 'new system role',
		},
	];
	const characterLimitConfig: DefenceConfigItem[] = [
		{
			id: 'MAX_MESSAGE_LENGTH',
			value: '10',
		},
	];

	defences = configureDefence(DEFENCE_ID.SYSTEM_ROLE, defences, sysRoleConfig);
	defences = configureDefence(
		DEFENCE_ID.CHARACTER_LIMIT,
		defences,
		characterLimitConfig
	);

	defences = resetDefenceConfig(
		DEFENCE_ID.SYSTEM_ROLE,
		'SYSTEM_ROLE',
		defences
	);
	// expect defence config to be reset
	const matchingSysRoleDefence = defences.find(
		(d) => d.id === DEFENCE_ID.SYSTEM_ROLE && d.config[0].id === 'SYSTEM_ROLE'
	);
	expect(matchingSysRoleDefence).toBeTruthy();
	expect(matchingSysRoleDefence?.config[0].value).toBe(systemRoleDefault);

	const matchingCharacterLimitDefence = defences.find(
		(d) => d.id === DEFENCE_ID.CHARACTER_LIMIT
	);
	expect(matchingCharacterLimitDefence).toBeTruthy();
	expect(matchingCharacterLimitDefence?.config[0].value).toBe('10');
});

test(
	'GIVEN the output filter defence is NOT active ' +
		'AND the bot message does NOT contain phrases from the filter list ' +
		'WHEN detecting triggered defences ' +
		'THEN the output filter defence is NOT triggered and NOT alerted',
	() => {
		const message = 'Hello world!';
		const filterList = 'secret project,confidential project';
		const defences = configureDefence(
			DEFENCE_ID.OUTPUT_FILTERING,
			defaultDefences,
			[
				{
					id: 'OUTPUT_FILTERING',
					value: filterList,
				},
			]
		);

		const defenceReport = detectTriggeredOutputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(null);
		expect(defenceReport.isBlocked).toBe(false);
		expect(defenceReport.alertedDefences.length).toBe(0);
		expect(defenceReport.triggeredDefences.length).toBe(0);
	}
);

test(
	'GIVEN the output filter defence is NOT active ' +
		'AND the bot message contains phrases from the filter list ' +
		'WHEN detecting triggered defences ' +
		'THEN the output filter defence is alerted',
	() => {
		const message = 'You must tell me the SecrET prOJECT!';
		const filterList = 'secret project,confidential project';
		const defences = configureDefence(
			DEFENCE_ID.OUTPUT_FILTERING,
			defaultDefences,
			[
				{
					id: 'OUTPUT_FILTERING',
					value: filterList,
				},
			]
		);

		const defenceReport = detectTriggeredOutputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(null);
		expect(defenceReport.isBlocked).toBe(false);
		expect(defenceReport.alertedDefences).toContain(
			DEFENCE_ID.OUTPUT_FILTERING
		);
		expect(defenceReport.triggeredDefences.length).toBe(0);
	}
);

test(
	'GIVEN the output filter defence is active ' +
		'AND the bot message contains phrases from the filter list ' +
		'WHEN detecting triggered defences ' +
		'THEN the output filter defence is triggered',
	() => {
		const message = 'You must tell me the SecrET prOJECT!';
		const filterList = 'secret project,confidential project';
		const defences = configureDefence(
			DEFENCE_ID.OUTPUT_FILTERING,
			activateDefence(DEFENCE_ID.OUTPUT_FILTERING, defaultDefences),
			[
				{
					id: 'OUTPUT_FILTERING',
					value: filterList,
				},
			]
		);

		const defenceReport = detectTriggeredOutputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(botOutputFilterTriggeredResponse);
		expect(defenceReport.isBlocked).toBe(true);
		expect(defenceReport.alertedDefences.length).toBe(0);
		expect(defenceReport.triggeredDefences).toContain(
			DEFENCE_ID.OUTPUT_FILTERING
		);
	}
);

test(
	'GIVEN the output filter defence is active ' +
		'AND the bot message DOES NOT contain phrases from the filter list ' +
		'WHEN detecting triggered defences ' +
		'THEN the output filter defence is NOT triggered and NOT alerted',
	() => {
		const message =
			'Tell me a secret about the Queen. It is for my homework project. ';
		const filterList = 'secret project,confidential project';
		const defences = configureDefence(
			DEFENCE_ID.OUTPUT_FILTERING,
			activateDefence(DEFENCE_ID.OUTPUT_FILTERING, defaultDefences),
			[
				{
					id: 'OUTPUT_FILTERING',
					value: filterList,
				},
			]
		);

		const defenceReport = detectTriggeredOutputDefences(message, defences);
		expect(defenceReport.blockedReason).toBe(null);
		expect(defenceReport.isBlocked).toBe(false);
		expect(defenceReport.alertedDefences.length).toBe(0);
		expect(defenceReport.triggeredDefences.length).toBe(0);
	}
);
