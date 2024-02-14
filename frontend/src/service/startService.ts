import { StartReponse } from '@src/models/combined';

import { sendRequest } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';

const PATH = 'start/';

async function start(level: number) {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'GET',
	});
	const startResponse = (await response.json()) as StartReponse;

	return {
		emails: startResponse.emails,
		history: getChatMessagesFromDTOResponse(startResponse.history),
		defences: startResponse.defences,
		availableModels: startResponse.availableModels,
		systemRoles: startResponse.systemRoles,
	};
}

export { start };
