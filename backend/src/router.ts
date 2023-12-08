import express from 'express';

import {
	handleChatToGPT,
	handleGetChatHistory,
	handleAddToChatHistory,
	handleClearChatHistory,
} from './controller/chatController';
import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleGetDefenceStatus,
	handleResetAllDefences,
	handleResetSingleDefence,
} from './controller/defenceController';
import { handleGetDocuments } from './controller/documentController';
import {
	handleClearEmails,
	handleGetEmails,
} from './controller/emailController';
import {
	handleConfigureModel,
	handleGetModel,
	handleSetModel,
} from './controller/modelController';
import { handleResetProgress } from './controller/resetController';
import { handleGetSystemRoles } from './controller/systemRoleController';

const router = express.Router();

// defences

router.post('/defence/activate', handleDefenceActivation);

router.post('/defence/deactivate', handleDefenceDeactivation);

router.post('/defence/configure', handleConfigureDefence);

router.post('/defence/reset', handleResetAllDefences);

router.post('/defence/resetConfig', handleResetSingleDefence);

router.get('/defence/status', handleGetDefenceStatus);

// emails

router.get('/email/get', handleGetEmails);

router.post('/email/clear', handleClearEmails);

// chat

router.post('/openai/chat', handleChatToGPT);

router.get('/openai/history', handleGetChatHistory);

router.post('/openai/addHistory', handleAddToChatHistory);

router.post('/openai/clear', handleClearChatHistory);

// model configurations

router.post('/openai/model', handleSetModel);

router.post('/openai/model/configure', handleConfigureModel);

router.get('/openai/model', handleGetModel);

// system roles

router.get('/systemRoles', handleGetSystemRoles);

// getting documents

router.get('/documents', handleGetDocuments);

// reset progress for all levels

router.post('/reset', handleResetProgress);

export { router };
