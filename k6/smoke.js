import http from 'k6/http';
// import exec from 'k6/execution';
import { check, sleep } from 'k6';

export const options = {
  vus: 3, // Key for Smoke test. Keep it at 2, 3, max 5 VUs
  duration: '10s', // This can be shorter or just a few iterations
};

export default () => {
  const data = { message: "hi", currentLevel: '3' };
  const url = 'http://localhost:3001/test/load';

  // console.log('VU ID:' + exec.vu.idInTest);
  let response = http.post(url, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(response, {
    'response code was 200': (response) => response.status === 200,
  });
  sleep(0.1);
};
