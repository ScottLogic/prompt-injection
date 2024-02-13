import { startReponse } from '@src/models/level';

import { sendRequest } from './backendService';

const PATH = 'levelState/';

async function start(level: number): Promise<startReponse> {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'GET',
	});
	const levelState = (await response.json()) as startReponse;

	// add stuff here to deal with failure cases

	return levelState;
}

export { start };
