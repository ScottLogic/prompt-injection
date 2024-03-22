import { LoadLevelResponse, ResetLevelResponse } from '@src/models/apiResponse';

import { sendRequest } from './backendService';
import {
	getChatMessagesFromDTOResponse,
	makeChatMessageFromDTO,
} from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'reset';

async function resetAllProgress(level: number) {
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

async function resetLevelProgress(level: number) {
	const response = await sendRequest(`resetlevel?level=${level}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const { resultingChatInfoMessage } =
		(await response.json()) as ResetLevelResponse;

	return makeChatMessageFromDTO(resultingChatInfoMessage);
}

export { resetAllProgress, resetLevelProgress };
