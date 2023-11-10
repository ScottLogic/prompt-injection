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

```bash
npm run dev
```

Alternatively, you can run using Docker:

```bash
# Start the server
npm run api:start
# View the logs
npm run api:logs
# Stop the server
npm run api:stop
```

## Test

```bash
npm test
```
