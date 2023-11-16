import { Request } from 'express';

type OpenAiConfigureModelRequest = Request<
	object,
	object,
	{
		configId?: string;
		value?: number;
	},
	object
>;

export type { OpenAiConfigureModelRequest };
