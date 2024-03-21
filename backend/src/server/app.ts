import cors from 'cors';
import express from 'express';
import queryTypes from 'query-types';

import nonSessionRoutes from './nonSessionRoutes';
import sessionRoutes from './sessionRoutes';
import uiRoutes from './uiRoutes';

const app = express()
	.use(express.json())
	.use(queryTypes.middleware());

const isDevelopment = process.env.NODE_ENV === 'development';
const isServingUI = process.env.NODE_ENV === 'prodlite';

// Enable CORS if set in env, and always when running in dev mode.
const origin = process.env.CORS_ALLOW_ORIGIN || (
	isDevelopment ? 'http://localhost:5173' : null
);
if (origin) {
	app.use(cors({ origin, credentials: true }));
}

// API routes
app.use('/api', nonSessionRoutes);
app.use('/api', sessionRoutes);

// Host the UI...
// TODO Relies on backend having been built! Need a check for that here.
isServingUI && app.use('/', uiRoutes);

export default app;
