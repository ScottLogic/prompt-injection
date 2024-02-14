import { StartReponse } from '@src/models/level';

import { sendRequest } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';

const PATH = 'start/';

async function start(level: number) {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'GET',
	});
	const startResponse = (await response.json()) as StartReponse;

	// add stuff here to deal with failure cases

	return {
		emails: startResponse.emails,
		history: getChatMessagesFromDTOResponse(startResponse.history),
		defences: startResponse.defences,
		availableModels: startResponse.availableModels,
		systemRoles: startResponse.systemRoles,
	};
}

export { start };
