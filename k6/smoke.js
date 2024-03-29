import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
	vus: 3, // Key for Smoke test. Keep it at 2, 3, max 5 VUs
	duration: '10s', // This can be shorter or just a few iterations
};

export default () => {
	const data = { infoMessage: 'Hi', chatMessageType: 'LEVEL_INFO', level: 3 };
	const url = 'http://localhost:3001/test/load';

	let response = http.post(url, JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
	});
	check(response, {
		'response code was 200': (response) => response.status === 200,
	});
	sleep(0.1);
};
