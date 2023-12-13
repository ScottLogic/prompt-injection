import { Response } from 'express';

function handleHealthCheck(_req: unknown, res: Response) {
	res.send();
}

export { handleHealthCheck };
