import { Request } from 'express';

import {
	DEFENCE_CONFIG_ITEM_ID,
	DEFENCE_ID,
	DefenceConfigItem,
} from '@src/models/defence';

export type DefenceConfigResetRequest = Request<
	never,
	DefenceConfigItem,
	{
		defenceId?: DEFENCE_ID;
		configId?: DEFENCE_CONFIG_ITEM_ID;
	},
	never
>;
