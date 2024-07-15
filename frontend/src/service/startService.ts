import { StartResponse } from '@src/models/apiResponse';

import { get } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';
import { processDocumentMetadata } from './documentService';

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
		availableDocs,
	} = (await response.json()) as StartResponse;

	const documents = availableDocs && processDocumentMetadata(availableDocs);

	return {
		emails,
		chatHistory: getChatMessagesFromDTOResponse(chatHistory),
		defences: defences ? getDefencesFromDTOs(defences) : [],
		availableModels,
		systemRoles,
		chatModel,
		documents,
	};
}

export { start };
