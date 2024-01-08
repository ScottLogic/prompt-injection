import { Response } from 'express';

import { ChatHttpResponse } from '@src/models/chat';

function sendErrorResponse(
	res: Response,
	statusCode: number,
	errorMessage: string
) {
	return res.status(statusCode).json(errorMessage);
}

function handleChatError(
	res: Response,
	chatResponse: ChatHttpResponse,
	blocked: boolean,
	errorMsg: string,
	statusCode = 500
) {
	console.error(errorMsg);
	const updatedChatResponse = {
		...chatResponse,
		reply: errorMsg,
		isError: true,
		defenceReport: {
			...chatResponse.defenceReport,
			isBlocked: blocked,
			blockedReason: blocked
				? errorMsg
				: chatResponse.defenceReport.blockedReason,
		},
	};

	return res.status(statusCode).json(updatedChatResponse);
}

export { sendErrorResponse, handleChatError };
