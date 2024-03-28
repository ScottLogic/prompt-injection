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
			fileURLToPath(new URL('../../resources/documents', importMetaUrl()))
		)
	)
	.get('/documents', handleGetDocuments)
	.get('/health', handleHealthCheck);
