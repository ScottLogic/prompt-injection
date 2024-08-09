import express from 'express';
import session from 'express-session';
import memoryStoreFactory from 'memorystore';

import {
	handleChatToGPT,
	handleAddInfoToChatHistory,
} from '@src/controller/chatController';
import {
	handleConfigureDefence,
	handleDefenceActivation,
	handleDefenceDeactivation,
	handleResetDefenceConfigItem,
} from '@src/controller/defenceController';
import { handleLoadLevel } from '@src/controller/levelController';
import {
	handleConfigureModel,
	handleSetModel,
} from '@src/controller/modelController';
import {
	handleResetLevel,
	handleResetProgress,
} from '@src/controller/resetController';
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

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
const stage = process.env.NODE_ENV || 'development';
console.log(`env=${stage}`);
const cookieName = process.env.COOKIE_NAME || 'SpyLogic.sid';
/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

const isProduction = stage === 'production';
const cookieStaleHours = Number(process.env.SESSION_EXPIRY_HOURS);
const defaultSessionTTL = 2;
const oneHourInMillis = 60 * 60 * 1000;
const maxAge =
	oneHourInMillis *
	(Number.isFinite(cookieStaleHours) ? cookieStaleHours : defaultSessionTTL);

const router = express.Router();

router.use(
	session({
		name: cookieName,
		resave: false,
		saveUninitialized: true,
		secret: sessionSigningSecret,
		// In-memory session storage means single instance or sticky sessions!
		// There are scalable alternatives:
		// https://www.npmjs.com/package/express-session#compatible-session-stores
		store: new (memoryStoreFactory(session))({
			checkPeriod: oneHourInMillis,
		}),
		// Trust proxy servers in production, else secure cookies won't work
		proxy: isProduction,
		cookie: {
			maxAge,
			/*
				https://developer.mozilla.org/en-US/blog/goodbye-third-party-cookies/
				Now browsers have begun clamping down on non-secure Cookies, we must
				set secure=true in production, meaning prod deployments must use https
			*/
			sameSite: isProduction ? 'none' : 'strict',
			secure: isProduction,
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
router.post('/defence/resetConfig', handleResetDefenceConfigItem);

// chat
router.post('/openai/chat', handleChatToGPT);
router.post('/openai/addInfoToHistory', handleAddInfoToChatHistory);

// model configurations
router.post('/openai/model', handleSetModel);
router.post('/openai/model/configure', handleConfigureModel);

// reset
router.post('/reset/all', handleResetProgress);
router.post('/reset/:level', handleResetLevel);

// Load testing endpoints
router.post('/test/load', handleTest);

export default router;
