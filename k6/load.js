import { postWithSessionUpdate } from './requestFunctions.js';

export const options = {
	//vus and duration can be changed depending on what simulation needed running
	scenarios: {
		contacts: {
			executor: 'constant-vus',
			vus: 100,
			duration: '30m',
		},
	},
};

export default () => {
	postWithSessionUpdate();
};
