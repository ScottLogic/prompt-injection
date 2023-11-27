import { Request } from 'express';

import { DEFENCE_TYPES, DefenceConfig } from '@src/models/defence';

export type DefenceConfigResetRequest = Request<
	never,
	DefenceConfig,
	{
		defenceId?: DEFENCE_TYPES;
		configId?: string;
	},
	never
>;
