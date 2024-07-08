import { Response } from 'express';

import { getSandboxDocumentMetas } from '@src/document';
import { LevelResetRequest } from '@src/models/api/LevelResetRequest';
import { ProgressResetRequest } from '@src/models/api/ProgressResetRequest';
import { defaultChatModel } from '@src/models/chat';
import { ChatInfoMessage } from '@src/models/chatMessage';
import { LEVEL_NAMES, getInitialLevelStates } from '@src/models/level';

import { validateLevel } from './requestValidators';

function handleResetProgress(req: ProgressResetRequest, res: Response) {
	const level = validateLevel(res, req.query.level);
	if (level === null) return;

	console.debug('Resetting progress for all levels');
	req.session.levelState = getInitialLevelStates();
	req.session.chatModel = defaultChatModel;

	const chatModel =
		level === LEVEL_NAMES.SANDBOX ? req.session.chatModel : undefined;
	const availableDocs =
		level === LEVEL_NAMES.SANDBOX ? getSandboxDocumentMetas() : undefined;

	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		chatModel,
		availableDocs,
	});
}

function handleResetLevel(req: LevelResetRequest, res: Response) {
	const level = validateLevel(res, Number(req.params.level) as LEVEL_NAMES);
	if (level === null) return;

	console.debug(`Resetting progress for level ${level}`);
	req.session.levelState[level].chatHistory = [];
	req.session.levelState[level].sentEmails = [];
	res.send({
		chatInfoMessage: {
			infoMessage: `Level progress reset`,
			chatMessageType: 'RESET_LEVEL',
		} as ChatInfoMessage,
	});
}

export { handleResetProgress, handleResetLevel };
