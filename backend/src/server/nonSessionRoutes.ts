import express from 'express';
import { fileURLToPath } from 'node:url';

import { handleGetDocuments } from '@src/controller/documentController';
import { handleHealthCheck } from '@src/controller/healthController';

import { importMetaUrl } from './importMetaUtils';

export default express
	.Router()
	.use(
		'/documents',
		express.static(
			fileURLToPath(new URL('../../resources/documents', importMetaUrl())),
			{
				cacheControl: true,
				maxAge: 604800000, // 7 days as millis
				immutable: true,
				index: false,
			}
		)
	)
	.get('/documents', handleGetDocuments)
	.get('/health', handleHealthCheck);
