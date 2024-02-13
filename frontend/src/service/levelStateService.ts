import { LevelState } from '@src/models/level';

import { sendRequest } from './backendService';

const PATH = 'reset';

async function getLevelState(level: number): Promise<LevelState> {
	const response = await sendRequest(`${PATH}history?level=${level}`, {
		method: 'GET',
	});
	const levelState = (await response.json()) as LevelState;

	// add stuff here to deal ith failure cases

	return levelState;
}

export { getLevelState };
