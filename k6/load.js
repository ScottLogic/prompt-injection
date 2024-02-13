import http from 'k6/http';
import {check, sleep} from 'k6';

export const options = {
  // Key configurations for avg load test in this section
  stages: [
    { duration: '5m', target: 100 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
    { duration: '5m', target: 100 }, // stay at 100 users for 30 minutes
    { duration: '5m', target: 0 }, // ramp-down to 0 users
  ],
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
    sleep(1);
};