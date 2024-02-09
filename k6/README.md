# K6 ReadMe

## Introduction

Grafana k6 is an open-source load testing tool that makes performance testing easy and productive for engineering teams. k6 is free, developer-centric, and extensible. In this project we are using k6 for manual load testing. The following readMe will give basic instructions on where, what and how to install and run.

## Installation

[Download and install k6](https://grafana.com/docs/k6/latest/get-started/installation/). Follow the instructions on the link for your installer of choice

## Running locally

1. Make sure local backend is running, [refer to the backend README](../backend/README.md)
1. in a separate terminal cd into the K6 folder and run `k6 run script.js` (Where 'script' is the name of the script you want to run)