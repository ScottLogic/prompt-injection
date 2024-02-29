import { requestFunction } from './requestFunctionExtract.js';

export const options = {
	// Key configurations for spike in this section
	stages: [
		{ duration: '2ms', target: 2000 }, // fast ramp-up to a high point
		{ duration: '1m', target: 0 }, // quick ramp-down to 0 users
	],
};

export default async function () {
	requestFunction();
}
