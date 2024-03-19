import { LoadLevelResponse } from '@src/models/combined';

import { sendRequest } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'reset';

async function resetAllLevelProgress(level: number) {
	const response = await sendRequest(`${PATH}?level=${level}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const { defences, emails, chatHistory, chatModel } =
		(await response.json()) as LoadLevelResponse;

	return {
		emails,
		chatHistory: getChatMessagesFromDTOResponse(chatHistory),
		defences: defences ? getDefencesFromDTOs(defences) : [],
		chatModel,
	};
}

export { resetAllLevelProgress };
