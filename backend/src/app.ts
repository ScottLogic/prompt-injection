import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import memoryStoreFactory from 'memorystore';
import { fileURLToPath } from 'node:url';

import { importMetaUrl } from './importMetaUtils';
import { ChatModel, defaultChatModel } from './models/chat';
import { LevelState, levelsInitialState } from './models/level';
import { router } from './router';

dotenv.config();

declare module 'express-session' {
	interface Session {
		initialised: boolean;
		chatModel: ChatModel;
		levelState: LevelState[];
	}
}

const app = express();
const isProd = app.get('env') === 'production';

// for parsing application/json
app.use(express.json());

// use session storage - currently in-memory, but in future use Redis in prod builds
const maxAge = 60 * 60 * 1000 * (isProd ? 1 : 8); //1 hour in prod, 8hrs in dev
const sessionOpts: session.SessionOptions = {
	store: new (memoryStoreFactory(session))({
		checkPeriod: maxAge,
	}),
	secret: process.env.SESSION_SECRET ?? 'secret',
	name: 'prompt-injection.sid',
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: isProd,
		maxAge,
	},
};

app.use(session(sessionOpts));

app.use(
	cors({
		credentials: true,
		origin: true,
	})
);

app.use((req, _res, next) => {
	// initialise session variables first time
	if (!req.session.initialised) {
		req.session.chatModel = defaultChatModel;
		req.session.levelState = levelsInitialState;
		req.session.initialised = true;
	}
	next();
});

app.use('/', router);

// serve the documents folder
app.use(
	'/documents',
	express.static(
		fileURLToPath(new URL('../resources/documents', importMetaUrl()))
	)
);

export default app;
