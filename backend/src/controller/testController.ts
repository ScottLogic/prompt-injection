import { Response } from 'express';

import { OpenAiChatRequest } from '@src/models/api/OpenAiChatRequest';

function handleTest(req: OpenAiChatRequest, res: Response) {
    const { message, currentLevel } = req.body;

    if (!message || currentLevel === undefined) {
		console.log('Missing or empty message or level');
        res.send(400);	
		return;
	}
    else{
        console.log('Dummy test endpoint');
        res.send(200);
    }

}
export { handleTest };
