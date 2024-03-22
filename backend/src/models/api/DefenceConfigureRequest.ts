import { Request } from 'express';

import { ChatInfoMessage } from '@src/models/chatMessage';
import { DEFENCE_ID, DefenceConfigItem } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

export type DefenceConfigureRequest = Request<
	never,
	| string
	| {
			resultingChatInfoMessage: ChatInfoMessage;
	  },
	{
		config?: DefenceConfigItem[];
		defenceId?: DEFENCE_ID;
		level?: LEVEL_NAMES;
	},
	never
>;
