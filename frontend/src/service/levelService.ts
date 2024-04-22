import { LoadLevelResponse } from '@src/models/apiResponse';

import { get } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'level';

async function loadLevel(level: number) {
	const response = await get(`${PATH}?level=${level}`);
	const { defences, emails, chatHistory, chatModel } =
		(await response.json()) as LoadLevelResponse;

	return {
		emails,
		chatHistory: getChatMessagesFromDTOResponse(chatHistory),
		defences: defences ? getDefencesFromDTOs(defences) : [],
		chatModel,
	};
}

export { loadLevel };
