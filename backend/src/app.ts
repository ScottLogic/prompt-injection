import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import memoryStoreFactory from 'memorystore';
import { fileURLToPath } from 'node:url';

import { importMetaUrl } from './importMetaUtils';
import { ChatModel, defaultChatModel } from './models/chat';
import { LevelState, getInitialLevelStates } from './models/level';
import { router } from './router';

dotenv.config();

declare module 'express-session' {
	interface Session {
		initialised: boolean;
		chatModel: ChatModel;
		levelState: LevelState[];
	}
}

// Check mandatory ENV vars
const sessionSigningSecret = process.env.SESSION_SECRET;
if (!sessionSigningSecret) {
	console.error("SESSION_SECRET not found in environment vars, cannot continue!");
	process.exit(1);
}

const app = express();
const isProd = app.get('env') === 'production';
console.log(`env=${app.get('env')}`);

// for parsing application/json
app.use(express.json());

app.use(
	cors({
		origin: process.env.CORS_ALLOW_ORIGIN,
		credentials: true,
	})
);

// This doesn't work with APIGW's newer HTTP API, cos it's using Forwarded
// request header, not X-Forwarded headers.
// It also doesn't work with NLB in between APIGW and ALB, cos X-Forwarded-Proto
// has only one entry: "http"
//app.set('trust proxy', 3);

// use session storage - currently in-memory, but in future use Redis in prod builds
const maxAge = 60 * 60 * 1000 * (isProd ? 4 : 8); //4hrs in prod, 8hrs in dev
const sessionOpts: session.SessionOptions = {
	name: 'prompt-injection.sid',
	resave: false,
	saveUninitialized: true,
	secret: sessionSigningSecret,
	store: new (memoryStoreFactory(session))({
		checkPeriod: maxAge,
	}),
	cookie: {
		maxAge,
		/*
			UI and API have different domains, until we buy a domain and put Route53
			in front of both.
			Currently this means we need to use a non-secure session cookie for it to
			get all the way through to/from the server, but that will be forbidden in
			most browsers in 2024 - see
			https://developer.mozilla.org/en-US/blog/goodbye-third-party-cookies/
			So, this workaround will soon break! The problem is that API Gateway uses
			the new, standard Forwarded header to convey proxy details, whereas ALB
			still uses non-standard but ubiquitous X-Forwarded- headers, so our node
			server receives both sets of headers and ignores the Forwarded header
			(which is our secure, trusted API Gateway proxy). Problem reported here:
			https://repost.aws/questions/QUtBHMaz7IQ6aM4RCBMnJvgw/why-does-apigw-http-api-use-forwarded-header-while-other-services-still-use-x-forwarded-headers
		*/
		sameSite: isProd ? 'none' : 'strict',
		secure: false, //isProd
	},
};

app.use(session(sessionOpts));

app.use((req, _res, next) => {
	// initialise session variables first time
	if (!req.session.initialised) {
		req.session.chatModel = defaultChatModel;
		req.session.levelState = getInitialLevelStates();
		req.session.initialised = true;
	}
	next();
});

app.use((req, res, next) => {
	if (req.path !== '/health' && isProd) {
		console.log('Request:', req.path, `secure=${req.secure}`, req.headers);
		res.on('finish', () => {
			console.log('Response:', req.path, res.getHeaders());
		});
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
