import { Response } from 'express';

import { handleAddInfoToChatHistory } from '@src/controller/chatController';
import { OpenAiAddInfoToChatHistoryRequest } from '@src/models/api/OpenAiAddInfoToChatHistoryRequest';

function handleTest(req: OpenAiAddInfoToChatHistoryRequest, res: Response) {
	const ranNum = Math.round((Math.random()+1)*1000);
	
	setTimeout(() => handleAddInfoToChatHistory(req, res), ranNum);
}
export { handleTest };
