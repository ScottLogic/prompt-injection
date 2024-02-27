import { check, sleep } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';

export const options = {
	 // Key configurations for spike in this section
     stages: [
        { duration: '2m', target: 2000 }, // fast ramp-up to a high point
        { duration: '1m', target: 0 }, // quick ramp-down to 0 users
      ],
};

const baseUrl = 'http://localhost:3001';
const cookieName = 'prompt-injection.sid';
const vuCookieJar = (() => {
	const cookieJars = {};
	return {
		get: (id) => cookieJars[id],
		set: (id, jar) => (cookieJars[id] = jar),
	};
})();

export default () => {
	// Use same jar for every iteration of same VU! k6 doesn't do this for us :(
	const vuID = exec.vu.idInTest;
	let jar = vuCookieJar.get(vuID);
	if (!jar) {
		jar = http.cookieJar();
		vuCookieJar.set(vuID, jar);
	}
	let originalCookie = (jar.cookiesForURL(baseUrl)[cookieName] || [])[0];

	const data = { infoMessage: 'Hi', chatMessageType: 'LEVEL_INFO', level: 3 };
	const response = http.post(`${baseUrl}/test/load`, JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
		jar,
	});
	// Expecting cookie to match original, OR first-time be added to the jar
	const expectedCookie =
		originalCookie || jar.cookiesForURL(baseUrl)[cookieName][0];
	check(response, {
		'response code was 200': (response) => response.status === 200,
		'cookie was preserved': (response) =>
			response.cookies[cookieName].length === 1 &&
			response.cookies[cookieName][0].value === expectedCookie,
	});

	sleep(1);
};
