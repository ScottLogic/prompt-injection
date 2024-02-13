import { LevelState } from '@src/models/level';

import { sendRequest } from './backendService';

const PATH = 'levelState/';

async function getLevelState(level: number): Promise<LevelState> {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'GET',
	});
	const levelState = (await response.json()) as LevelState;

	// add stuff here to deal with failure cases

	return levelState;
}

export { getLevelState };
