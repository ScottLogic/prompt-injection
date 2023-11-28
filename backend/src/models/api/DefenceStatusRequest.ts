import { Request } from 'express';

import { DefenceInfo } from '@src/models/defence';

export type DefenceStatusRequest = Request<
	never,
	DefenceInfo[] | string,
	never,
	{
		level?: string;
	}
>;
