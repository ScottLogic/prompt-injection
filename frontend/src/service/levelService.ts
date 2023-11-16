import { sendRequest } from './backendService';

const PATH = 'level/';

// get the prompt/system role for a level
async function getLevelPrompt(level: number) {
	const response = await sendRequest(`${PATH}prompt?level=${level}`, 'GET');
	const data = await response.text();
	return data;
}

export { getLevelPrompt };
