import { LoadLevelResponse } from '@src/models/combined';

import { sendRequest } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'level/';

async function loadLevel(level: number) {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'GET',
	});
	const { defences, emails, chatHistory } =
		(await response.json()) as LoadLevelResponse;

	return {
		emails,
		chatHistory: getChatMessagesFromDTOResponse(chatHistory),
		defences: getDefencesFromDTOs(defences),
	};
}

export { loadLevel };
