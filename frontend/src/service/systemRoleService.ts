import { LevelSystemRole } from '@src/models/level';

import { sendRequestOld } from './backendService';

const PATH = 'systemRoles/';

// get the system roles for all levels
async function getSystemRoles(): Promise<LevelSystemRole[]> {
	const response = await sendRequestOld(`${PATH}`, 'GET');
	const data = (await response.json()) as LevelSystemRole[];
	return data;
}

export { getSystemRoles };
