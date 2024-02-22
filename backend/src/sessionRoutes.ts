import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import memoryStoreFactory from 'memorystore';

import {
	handleChatToGPT,
	handleAddInfoToChatHistory,
	handleClearChatHistory,
} from './controller/chatController';
import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleResetSingleDefence,
} from './controller/defenceController';
import {
	handleClearEmails,
	handleGetEmails,
} from './controller/emailController';
import { handleLoadLevel } from './controller/levelController';
import {
	handleConfigureModel,
	handleGetModel,
	handleSetModel,
} from './controller/modelController';
import { handleResetProgress } from './controller/resetController';
import { handleStart } from './controller/startController';
import { handleTest } from './controller/testController';
import { ChatModel, defaultChatModel } from './models/chat';
import { LevelState, getInitialLevelStates } from './models/level';

declare module 'express-session' {
	interface Session {
		initialised: boolean;
		chatModel: ChatModel;
		levelState: LevelState[];
	}
}

const sessionSigningSecret = process.env.SESSION_SECRET;
if (!sessionSigningSecret) {
	console.error(
		'SESSION_SECRET not found in environment vars, cannot continue!'
	);
	process.exit(1);
}

const router = express.Router();

const stage = process.env.NODE_ENV;
console.log(`env=${stage}`);
const isProd = stage === 'production';
const cookieStaleHours = isProd ? 2 : 8;
const oneHourInMillis = 60 * 60 * 1000;
const maxAge = oneHourInMillis * cookieStaleHours;

router.use(
	session({
		name: 'prompt-injection.sid',
		resave: false,
		saveUninitialized: true,
		secret: sessionSigningSecret,
		// Session storage: currently in-memory but could use Redis in AWS
		store: new (memoryStoreFactory(session))({
			checkPeriod: oneHourInMillis,
		}),
		proxy: isProd,
		cookie: {
			maxAge,
			/*
				https://developer.mozilla.org/en-US/blog/goodbye-third-party-cookies/
				Now that browsers have begun clamping down on non-secure Cookies, we
				need to set secure=true in prod, until we can put Route53 in front of both
				UI and API and get rid of APIGateway entirely. The showstopper is that
				APIGateway is not adding Forwarded headers correctly, so the (secure)
				session Cookie is no longer working in Prod.
				See
				https://repost.aws/questions/QUtBHMaz7IQ6aM4RCBMnJvgw/why-does-apigw-http-api-use-forwarded-header-while-other-services-still-use-x-forwarded-headers
			*/
			sameSite: isProd ? 'none' : 'strict',
			secure: isProd,
		},
	})
);

router.use((req, _res, next) => {
	if (!req.session.initialised) {
		req.session.chatModel = defaultChatModel;
		req.session.levelState = getInitialLevelStates();
		req.session.initialised = true;
	}
	next();
});

// handshake
router.get('/start', handleStart);

router.get('/level', handleLoadLevel);

// defences
router.post('/defence/activate', handleDefenceActivation);
router.post('/defence/deactivate', handleDefenceDeactivation);
router.post('/defence/configure', handleConfigureDefence);
router.post('/defence/resetConfig', handleResetSingleDefence);

// emails
router.get('/email/get', handleGetEmails);
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

// Debugging: log headers in prod for primary routes
if (isProd) {
	router.use('/openai', (req, res, next) => {
		console.log('Request:', req.path, `secure=${req.secure}`, req.headers);
		res.on('finish', () => {
			console.log('Response:', req.path, res.getHeaders());
		});
		next();
	});
}

// Testing dummy endpoint
router.post('/test/load', handleTest);

export default router;
