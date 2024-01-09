# prompt-injection-api

This is the API module of prompt-injection.

## Install

```bash
npm ci
```

## Setup Environment

1. Copy the example environment file [.env.example](.env.example) and rename it to `.env`.
1. Replace the `OPENAI_API_KEY` value in `.env` with your
   [OpenAI API key](https://platform.openai.com/account/api-keys).
1. Replace the `SESSION_SECRET` value with a [random UUID](https://www.uuidgenerator.net/) or other long phrase.

## Run

Start the server:

```bash
npm start
```

Or for development, to hot-reload on changes:

```bash
npm run dev
```

You can also run using Docker if you prefer:

```bash
# Start the server
npm run docker:start
# View the logs
npm run docker:logs
# Stop the server
npm run docker:stop
```

## Linting and Formatting

To manually lint and format:

```bash
npm run lint
npm run format
```

## Test

```bash
npm test
```
