import cors from 'cors';
import express from 'express';

import nonSessionRoutes from './nonSessionRoutes';
import { usingForwardedHeader } from './proxySetup';
import sessionRoutes from './sessionRoutes';

export default usingForwardedHeader(express())
	.use(express.json())
	.use(
		cors({
			origin: process.env.CORS_ALLOW_ORIGIN,
			credentials: true,
		})
	)
	.use('/', nonSessionRoutes)
	.use('/', sessionRoutes);