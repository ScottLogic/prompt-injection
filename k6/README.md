# SpyLogic : K6 Testing

Grafana k6 is an open-source load testing tool that makes performance testing easy and productive for engineering teams.
k6 is free, developer-centric, and extensible.

In this project we are using k6 for manual load testing; read on for
instructions on where, what and how to install and run.

## Installation

[Download and install k6](https://grafana.com/docs/k6/latest/get-started/installation/), then follow the instructions in the link for your installer of choice.

## Running locally

1. Make sure local backend is running - [see the backend README](../backend/README.md).

2. In a separate terminal, cd into the k6 folder and run  
   `npm test TESTFILE`  
   where TESTFILE is one of `load.js`, `smoke.js` or `spike.js`.

3. If you want a dashboard to view and track trends in real time, run  
   `npm run test:dash TESTFILE`  
   with TESTFILE as described above.
