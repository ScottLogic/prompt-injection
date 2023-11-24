import { Request } from 'express';

import { DEFENCE_ID, DefenceConfigItem } from '@src/models/defence';

export type DefenceConfigResetRequest = Request<
	never,
	DefenceConfigItem,
	{
		defenceId?: DEFENCE_ID;
		configId?: string;
	},
	never
>;
