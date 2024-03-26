import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { env, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import queryTypes from 'query-types';

import { importMetaUrl } from './importMetaUtils';
import nonSessionRoutes from './nonSessionRoutes';
import sessionRoutes from './sessionRoutes';
import uiRoutes from './uiRoutes';

const app = express().use(express.json()).use(queryTypes.middleware());

const isDevelopment = env.NODE_ENV === 'development';
const isServingUI = env.NODE_ENV === 'prodlite';

// Enable CORS if set in env, and always when running in dev mode.
const origin =
	env.CORS_ALLOW_ORIGIN ?? (isDevelopment ? 'http://localhost:5173' : null);
if (origin) {
	app.use(cors({ origin, credentials: true }));
}

// API routes
app.use('/api', nonSessionRoutes);
app.use('/api', sessionRoutes);

// Host the UI?
if (isServingUI) {
	const uiBuildPath = fileURLToPath(
		new URL('../../../frontend/dist/index.html', importMetaUrl())
	);
	if (!existsSync(uiBuildPath)) {
		console.error('UI build not found, cannot serve it!');
		exit(1);
	}
	app.use('/', uiRoutes);
}

export default app;
