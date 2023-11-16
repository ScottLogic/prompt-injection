import { Request } from 'express';

import { DEFENCE_TYPES } from '@src/models/defence';

type DefenceConfigResetRequest = Request<
	object,
	object,
	{
		defenceId?: DEFENCE_TYPES;
		configId?: string;
	},
	object
>;

export type { DefenceConfigResetRequest };
