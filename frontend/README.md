# SpyLogic : UI

This is the UI module of the SpyLogic app. It is a React [SPA](https://en.wikipedia.org/wiki/Single-page_application) without routing, and built to be as
accessible as possible. If you find a problem with keyboard navigation, screen reader usage, colour contrast or any
other accessibility concern, please [open an issue](../CONTRIBUTING.md).

We are working on making the app useable up to 200% zoom, so please be patient with us!

## Install

```bash
npm ci
```

## Setup Environment

1. If you've not done so already, copy file [.env.example](.env.example) and name the copy `.env`.
1. If you've changed the default port for running the API, adjust the `VITE_BACKEND_URL` value accordingly.

## Run

We are using [Vite](https://vitejs.dev/) to bootstrap, build and run our UI locally.

### development

Run the dev server which will hot-reload on changes:

```bash
npm run dev
```

### production

Note that for simplicity, we recommend hosting the UI through the backend when running locally. Follow instructions in
the main [README](../README.md).

To build and run the UI separately:

```bash
# Build if you've not done so yet
npm run build

# Any server can then host the resulting dist/ folder ...

# Locally you can use Vite Preview
npm run preview # then type 'o' to open browser

# Or the "serve" package
npx serve dist -l 5000 # then navigate to localhost:5000 in browser
```

## Linting and Formatting

To manually lint and format:

```bash
npm run lint
npm run format
```

## Test

We are using [Vitest](https://vitest.dev/) as our test runner. This is much like Jest, except that because we are using
Vite, we can share much of the build and transform config.

```bash
npm test
```
