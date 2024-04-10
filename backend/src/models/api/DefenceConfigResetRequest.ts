import { Request } from 'express';

import {
	DEFENCE_CONFIG_ITEM_ID,
	DEFENCE_ID,
	DefenceConfigItem,
} from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

export type DefenceConfigItemResetRequest = Request<
	never,
	DefenceConfigItem,
	{
		defenceId?: DEFENCE_ID;
		configItemId?: DEFENCE_CONFIG_ITEM_ID;
		level?: LEVEL_NAMES;
	},
	never
>;
