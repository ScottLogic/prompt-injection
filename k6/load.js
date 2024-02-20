import http from 'k6/http';
import exec from 'k6/execution';
import {check, sleep} from 'k6';

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

export default () => {
    const data = { infoMessage: "Hi", chatMessageType: 'LEVEL_INFO' , level: 3};
    const url = 'http://localhost:3001/test/load';
  
    let response = http.post(url, JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    }
    );
    check(response, {
      'response code was 200': (response) => response.status === 200,
    });
    console.log('VU ID:' + exec.vu.idInTest);
    console.log('Cookie:' + response.cookies['prompt-injection.sid'][0].value);
  
    sleep(1);
};