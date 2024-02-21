import { StartReponse } from '@src/models/combined';

import { sendRequest } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'start/';

async function start(level: number) {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'GET',
	});
	const { availableModels, defences, emails, chatHistory, systemRoles } =
		(await response.json()) as StartReponse;

	return {
		emails,
		history: getChatMessagesFromDTOResponse(chatHistory),
		defences: getDefencesFromDTOs(defences),
		availableModels,
		systemRoles,
	};
}

export { start };
