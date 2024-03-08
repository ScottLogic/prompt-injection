import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import memoryStoreFactory from 'memorystore';

import {
	handleChatToGPT,
	handleAddInfoToChatHistory,
	handleClearChatHistory,
} from '@src/controller/chatController';
import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleResetSingleDefence,
} from '@src/controller/defenceController';
import { handleClearEmails } from '@src/controller/emailController';
import { handleLoadLevel } from '@src/controller/levelController';
import {
	handleConfigureModel,
	handleGetModel,
	handleSetModel,
} from '@src/controller/modelController';
import { handleResetProgress } from '@src/controller/resetController';
import { handleStart } from '@src/controller/startController';
import { handleTest } from '@src/controller/testController';
import { defaultChatModel } from '@src/models/chat';
import { getInitialLevelStates } from '@src/models/level';

const sessionSigningSecret = process.env.SESSION_SECRET;
if (!sessionSigningSecret) {
	console.error(
		'SESSION_SECRET not found in environment vars, cannot continue!'
	);
	process.exit(1);
}

const cookieName = process.env.COOKIE_NAME;
const stage = process.env.NODE_ENV;
console.log(`env=${stage}`);
const isProd = stage === 'production';
const cookieStaleHours = isProd ? 2 : 8;
const oneHourInMillis = 60 * 60 * 1000;
const maxAge = oneHourInMillis * cookieStaleHours;

const router = express
	.Router()
	.use(
		session({
			name: cookieName,
			resave: false,
			saveUninitialized: true,
			secret: sessionSigningSecret,
			// Session storage: currently in-memory but could use Redis in AWS
			store: new (memoryStoreFactory(session))({
				checkPeriod: oneHourInMillis,
			}),
			cookie: {
				maxAge,
				sameSite: 'strict',
				secure: isProd,
			},
			proxy: true,
		})
	)
	.use((req, _res, next) => {
		if (!req.session.initialised) {
			req.session.chatModel = defaultChatModel;
			req.session.levelState = getInitialLevelStates();
			req.session.initialised = true;
		}
		next();
	});

// TODO: Remove this debug logging!
if (isProd) {
	router.use('/openai', (req, res, next) => {
		console.log('Request:', req.path, `secure=${req.secure}`, req.headers);
		res.on('finish', () => {
			console.log('Response:', req.path, res.getHeaders());
		});
		next();
	});
}

// handshake
router.get('/start', handleStart);

router.get('/level', handleLoadLevel);

// defences
router.post('/defence/activate', handleDefenceActivation);
router.post('/defence/deactivate', handleDefenceDeactivation);
router.post('/defence/configure', handleConfigureDefence);
router.post('/defence/resetConfig', handleResetSingleDefence);

// emails
router.post('/email/clear', handleClearEmails);

// chat
router.post('/openai/chat', handleChatToGPT);
router.post('/openai/addInfoToHistory', handleAddInfoToChatHistory);
router.post('/openai/clear', handleClearChatHistory);

// model configurations
router.get('/openai/model', handleGetModel);
router.post('/openai/model', handleSetModel);
router.post('/openai/model/configure', handleConfigureModel);

// reset progress for all levels
router.post('/reset', handleResetProgress);

// Load testing endpoints
router.post('/test/load', handleTest);

export default router;
