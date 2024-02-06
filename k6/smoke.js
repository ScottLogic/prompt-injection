import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import { sleep } from 'k6';

export const options = {
  vus: 3, // Key for Smoke test. Keep it at 2, 3, max 5 VUs
  duration: '1m', // This can be shorter or just a few iterations
};

export default () => {
  let data = { message: "hi", currentLevel: '3' };
  const url = 'http://localhost:3001/openai/chat';

  let response = http.post(url, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.status).to.equal(200);
  sleep(1);
};
