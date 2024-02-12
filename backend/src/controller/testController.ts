import { Response } from 'express';

function handleTest(_req: unknown, res: Response) {
	res.send('Simple Test Json');
}

export { handleTest };
