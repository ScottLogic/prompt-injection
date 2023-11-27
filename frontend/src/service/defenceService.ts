import {
	DEFENCE_TYPES,
	DefenceConfig,
	DefenceInfo,
	DefenceResetResponse,
} from '@src/models/defence';

import { sendRequest } from './backendService';

const PATH = 'defence/';

async function getDefences(level: number) {
	const response = await sendRequest(`${PATH}status?level=${level}`, 'GET');
	const data = (await response.json()) as DefenceInfo[];
	return data;
}

async function activateDefence(
	defenceId: string,
	level: number
): Promise<boolean> {
	const response = await sendRequest(
		`${PATH}activate`,
		'POST',
		{ 'Content-Type': 'application/json' },
		JSON.stringify({ defenceId, level })
	);
	return response.status === 200;
}

async function deactivateDefence(
	defenceId: string,
	level: number
): Promise<boolean> {
	const response = await sendRequest(
		`${PATH}deactivate`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({ defenceId, level })
	);
	return response.status === 200;
}

async function configureDefence(
	defenceId: string,
	config: DefenceConfig[],
	level: number
): Promise<boolean> {
	const response = await sendRequest(
		`${PATH}configure`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({ defenceId, config, level })
	);
	return response.status === 200;
}

async function resetDefenceConfig(
	defenceId: string,
	configId: string
): Promise<DefenceResetResponse> {
	const response = await sendRequest(
		`${PATH}resetConfig`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({ defenceId, configId })
	);
	const data = (await response.json()) as DefenceResetResponse;
	return data;
}

function validatePositiveNumberConfig(config: string) {
	// config is a number greater than zero
	return !isNaN(Number(config)) && Number(config) > 0;
}

function validateNonEmptyStringConfig(config: string) {
	// config is non empty string and is not a number
	return config !== '' && !Number(config);
}

function validateFilterConfig(config: string) {
	// config is not a list of empty commas
	const commaPattern = /^,*,*$/;
	return config === '' || !commaPattern.test(config);
}

function validateDefence(id: string, config: string) {
	switch (id) {
		case DEFENCE_TYPES.CHARACTER_LIMIT:
			return validatePositiveNumberConfig(config);
		case DEFENCE_TYPES.FILTER_USER_INPUT:
		case DEFENCE_TYPES.FILTER_BOT_OUTPUT:
			return validateFilterConfig(config);
		default:
			return validateNonEmptyStringConfig(config);
	}
}

async function resetActiveDefences(level: number) {
	const response = await sendRequest(
		`${PATH}reset`,
		'POST',
		{
			'Content-Type': 'application/json',
		},
		JSON.stringify({ level })
	);
	return response.status === 200;
}

export {
	getDefences,
	activateDefence,
	deactivateDefence,
	configureDefence,
	resetDefenceConfig,
	resetActiveDefences,
	validateDefence,
};
