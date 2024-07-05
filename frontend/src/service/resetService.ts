import {
	LoadLevelResponse,
	ChatInfoMessageResponse,
} from '@src/models/apiResponse';

import { post } from './backendService';
import {
	getChatMessagesFromDTOResponse,
	makeChatMessageFromDTO,
} from './chatService';
import { getDefencesFromDTOs } from './defenceService';

const PATH = 'reset';

async function resetAllProgress(level: number) {
	const response = await post(`${PATH}/all?level=${level}`);

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
	const response = await post(`${PATH}/${level}`);

	const { chatInfoMessage } =
		(await response.json()) as ChatInfoMessageResponse;

	return makeChatMessageFromDTO(chatInfoMessage);
}

export { resetAllProgress, resetLevelProgress };
