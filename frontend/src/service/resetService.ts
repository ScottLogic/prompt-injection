import {
	LoadLevelResponse,
	ChatInfoMessageResponse,
} from '@src/models/apiResponse';

import { sendRequest } from './backendService';
import {
	getChatMessagesFromDTOResponse,
	makeChatMessageFromDTO,
} from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'reset';

async function resetAllProgress(level: number) {
	const response = await sendRequest(`${PATH}/all?level=${level}`, {
		method: 'POST',
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

async function resetLevelProgress(level: number) {
	const response = await sendRequest(`${PATH}/${level}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const { chatInfoMessage } =
		(await response.json()) as ChatInfoMessageResponse;

	return makeChatMessageFromDTO(chatInfoMessage);
}

export { resetAllProgress, resetLevelProgress };
