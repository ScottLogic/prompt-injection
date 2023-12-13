import { LevelSystemRole } from '@src/models/level';

import { sendRequest } from './backendService';

const PATH = 'systemRoles/';

// get the system roles for all levels
async function getSystemRoles(): Promise<LevelSystemRole[]> {
	const response = await sendRequest(PATH, { method: 'GET' });
	return (await response.json()) as LevelSystemRole[];
}

export { getSystemRoles };
