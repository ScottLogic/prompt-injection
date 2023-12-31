import { Response } from 'express';

import { ChatHttpResponse } from '@src/models/chat';

function sendErrorResponse(
	res: Response,
	statusCode: number,
	errorMessage: string
) {
	res.status(statusCode);
	res.send(errorMessage);
}

function handleChatError(
	res: Response,
	chatResponse: ChatHttpResponse,
	blocked: boolean,
	errorMsg: string,
	statusCode = 500
) {
	console.error(errorMsg);
	chatResponse.reply = errorMsg;
	chatResponse.defenceReport.isBlocked = blocked;
	chatResponse.isError = true;
	if (blocked) {
		chatResponse.defenceReport.blockedReason = errorMsg;
	}
	res.status(statusCode);
	res.send(chatResponse);
}

export { sendErrorResponse, handleChatError };
