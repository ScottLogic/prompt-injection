import { Response } from 'express';

import { LevelGetRequest } from '@src/models/api/LevelGetRequest';
import { LevelResetRequest } from '@src/models/api/LevelResetRequest';
import { defaultChatModel } from '@src/models/chat';
import { ChatInfoMessage } from '@src/models/chatMessage';
import {
	LEVEL_NAMES,
	getInitialLevelStates,
	isValidLevel,
} from '@src/models/level';

function handleResetProgress(req: LevelGetRequest, res: Response) {
	const { level } = req.query;

	if (level === undefined) {
		res.status(400).send('Level not provided');
		return;
	}

	if (!isValidLevel(level)) {
		res.status(400).send('Invalid level');
		return;
	}

	console.debug('Resetting progress for all levels', req.session.levelState);
	req.session.levelState = getInitialLevelStates();
	req.session.chatModel = defaultChatModel;
	res.send({
		emails: req.session.levelState[level].sentEmails,
		chatHistory: req.session.levelState[level].chatHistory,
		defences: req.session.levelState[level].defences,
		chatModel:
			level === LEVEL_NAMES.SANDBOX ? req.session.chatModel : undefined,
	});
}

function handleResetLevel(req: LevelResetRequest, res: Response) {
	const { level } = req.query;

	if (level === undefined) {
		res.status(400).send('Level not provided');
		return;
	}

	if (!isValidLevel(level)) {
		res.status(400).send('Invalid level');
		return;
	}

	console.debug('Resetting progress for level ', level);
	req.session.levelState[level].chatHistory = [];
	req.session.levelState[level].sentEmails = [];
	res.send({
		resultingChatInfoMessage: {
			infoMessage: `Level progress reset`,
			chatMessageType: 'RESET_LEVEL',
		} as ChatInfoMessage,
	});
}

export { handleResetProgress, handleResetLevel };
