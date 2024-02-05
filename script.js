import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import { sleep } from 'k6';

export const options = {
  // // Key configurations for spike in this section
  //Spike
  // stages: [
  //   { duration: '30s', target: 100 }, // fast ramp-up to a high point
  //   // No plateau
  //   { duration: '30s', target: 0 }, // quick ramp-down to 0 users
  // ],

  //Breakpoint
  executor: 'ramping-arrival-rate', //Assure load increase if the system slows
  stages: [
    { duration: '2h', target: 20000 }, // just slowly ramp-up to a HUGE load
  ]
};

export default function () {
  let data = { message: "hi", currentLevel: '3' };
  const url = 'http://localhost:3001/openai/chat';

  let response = http.post(url, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  // console.log(response.json());
  expect(response.status).to.equal(200);
  sleep(1);
  // MORE STEPS
  // Add only the processes that will be on high demand
  // Step1
  // Step2
  // etc.
};
