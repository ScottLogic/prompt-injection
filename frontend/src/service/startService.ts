import { StartResponse } from '@src/models/apiResponse';

import { get } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'start';

async function start(level: number) {
	const response = await get(`${PATH}?level=${level}`);
	const {
		availableModels,
		defences,
		emails,
		chatHistory,
		systemRoles,
		chatModel,
	} = (await response.json()) as StartResponse;

	return {
		emails,
		chatHistory: getChatMessagesFromDTOResponse(chatHistory),
		defences: defences ? getDefencesFromDTOs(defences) : [],
		availableModels,
		systemRoles,
		chatModel,
	};
}

export { start };
