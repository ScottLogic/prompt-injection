import { check, sleep } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';

export const options = {
	// Key configurations for avg load test in this section
	// stages: [
	//   { duration: '5m', target: 100 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
	//   { duration: '5m', target: 100 }, // stay at 100 users for 30 minutes
	//   { duration: '5m', target: 0 }, // ramp-down to 0 users
	// ],
	vus: 2, // Key for Smoke test. Keep it at 2, 3, max 5 VUs
	// duration: '10s', // This can be shorter or just a few iterations
	iterations: 4
};

const baseUrl = 'http://localhost:3001';
const cookieName = 'prompt-injection.sid';
const vuCookieJar = (() => {
	const cookieJars = {};
	return {
		get: (id) => cookieJars[id],
		set: (id, jar) => cookieJars[id] = jar,
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
	console.log(`Cookie was (${vuID}): ${originalCookie}`); //TODO Can remove this

	const data = { infoMessage: "Hi", chatMessageType: 'LEVEL_INFO', level: 3 };
	const response = http.post(`${baseUrl}/test/load`, JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
		jar
	});
	// Expecting cookie to match original, OR first-time be added to the jar
	const expectedCookie = originalCookie || jar.cookiesForURL(baseUrl)[cookieName][0];
	check(response, {
		'response code was 200': (response) => response.status === 200,
		'cookie was preserved': (response) =>
			response.cookies[cookieName].length === 1 &&
			response.cookies[cookieName][0].value === expectedCookie,
	});

	console.log(`Cookie now (${vuID}): ${jar.cookiesForURL(baseUrl)[cookieName][0]}`); //TODO Can remove this

	sleep(1);
};