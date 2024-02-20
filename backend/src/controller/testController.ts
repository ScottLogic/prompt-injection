import { Response } from 'express';

import { handleAddInfoToChatHistory } from '@src/controller/chatController';
import { OpenAiAddInfoToChatHistoryRequest } from '@src/models/api/OpenAiAddInfoToChatHistoryRequest';

function handleTest(req: OpenAiAddInfoToChatHistoryRequest, res: Response) {
	let num = 0;
	for (let x = 0; x <= 1000000; x++) {
		num = num++;
	}
	handleAddInfoToChatHistory(req, res);	
}
export { handleTest };
