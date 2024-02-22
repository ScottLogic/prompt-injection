import express from 'express';
import { fileURLToPath } from 'node:url';

import { handleGetDocuments } from './controller/documentController';
import { handleHealthCheck } from './controller/healthController';
import { importMetaUrl } from './importMetaUtils';

const router = express.Router();

router.use(
	'/documents',
	express.static(
		fileURLToPath(new URL('../resources/documents', importMetaUrl()))
	)
);
router.get('/documents', handleGetDocuments);
router.get('/health', handleHealthCheck);

export default router;
