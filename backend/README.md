# SpyLogic : API

This is the backend module of the SpyLogic app. We are using [Express](https://expressjs.com/) to serve the API.

In `production` (containerised) and `development` modes we only serve the API. However, in `prodlite` mode we also host
the UI through the Express server; the advantages of this are not needing to worry about CORS, and Cookies do not need
to be _secure_, as API and UI are [same origin and same site](https://web.dev/articles/same-site-same-origin).

## Install

```bash
npm ci
```

## Setup Environment

See the main [README](../README.md) for setting up environment variables.

## Run

### development

Start the API and hot-reload on changes:

```bash
npm run dev
```

### prodlite

Start the API _and_ host the UI:

```bash
# If you've not yet built the frontend, do this first:
cd ../frontend && npm run build
cd ../backend

# Run the app:
npm start
```

### production

There is a [Dockerfile](./Dockerfile) for running the API in a container.

## Linting and Formatting

To manually lint and format:

```bash
npm run lint
npm run format
```

## Test

We use [Jest](https://jestjs.io/) for the backend tests.

```bash
npm test
```
