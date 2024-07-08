import { LoadLevelResponse } from '@src/models/apiResponse';

import { get } from './backendService';
import { getChatMessagesFromDTOResponse } from './chatService';
import { getDefencesFromDTOs } from './defenceService';
import { processDocumentMetadata } from './documentService';

const PATH = 'level';

async function loadLevel(level: number) {
	const response = await get(`${PATH}?level=${level}`);
	const { defences, emails, chatHistory, chatModel, availableDocs } =
		(await response.json()) as LoadLevelResponse;

	const documents = availableDocs && processDocumentMetadata(availableDocs);

	return {
		emails,
		chatHistory: getChatMessagesFromDTOResponse(chatHistory),
		defences: defences ? getDefencesFromDTOs(defences) : [],
		chatModel,
		documents,
	};
}

export { loadLevel };
