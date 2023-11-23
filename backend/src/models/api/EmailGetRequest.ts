import { Request } from 'express';

import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

export type EmailGetRequest = Request<
	never,
	EmailInfo[] | string,
	never,
	{
		level?: LEVEL_NAMES;
	}
>;
