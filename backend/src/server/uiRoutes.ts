import express from 'express';
import { fileURLToPath } from 'node:url';
import { importMetaUrl } from '@src/server/importMetaUtils';

export default express
	.Router()
	.use(
		express.static(
			fileURLToPath(new URL('../../../frontend/dist', importMetaUrl())),
			{
				maxAge: '86400000',
				immutable: true,
			}
		)
	);
