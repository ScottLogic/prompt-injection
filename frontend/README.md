# prompt-injection-ui

This is the UI module of prompt-injection.

## Install

```bash
npm ci
```

## Setup Environment

1. Copy the example environment file [.env.example](.env.example) and rename it to `.env`.
1. If you've changed the default port for running the API, adjust the `VITE_BACKEND_URL` value accordingly.

## Run

We are using [Vite](https://vitejs.dev/) to bootstrap, build and run our UI locally.

To build and run:

```bash
npm run preview
```

To run the dev server and hot-reload on changes:

```bash
npm run dev
```

## Test

We are using [Vitest](https://vitest.dev/) as our test runner. This is much like Jest, except that because we are using
Vite, we can share much of the build and transform config.

```bash
npm test
```