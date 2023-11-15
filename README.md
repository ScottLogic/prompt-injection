# prompt-injection

## Introduction

Welcome to the Scott Logic prompt injection open source project! 
As generative AI and LLMs become more prevalent, it becomes more important to learn about the dangers of prompt injection.
This project aims to teach people about prompt injection attacks that can be used on generative AI, and how to defend against such attacks.

This project is presented in two modes:

### Story mode

Go undercover and use prompt injection attacks on ScottBrewBot, a clever but flawed generative AI bot. Extract company secrets from the AI to progress through the levels, all the while learning about LLMs, prompt injection, and defensive measures.

### Sandbox mode

Activate and configure a number of different prompt injection defence measures to create your own security system. Then talk to the AI and try to crack it!

## Installation

```bash
npm ci
```

## Setup

### Environment variables

#### Backend

1. Copy the example environment file [.env.example](backend/.env.example) in the backend directory and rename it to `.env`.
1. Replace the `OPENAI_API_KEY` value in the `.env` file with your [OpenAI API key](https://platform.openai.com/account/api-keys).
1. Replace the `SESSION_SECRET` value with a [random UUID](https://www.uuidgenerator.net/).

#### Frontend

1. Copy the example environment file [.env.example](frontend/.env.example) in the frontend directory and rename it to `.env`.
1. Replace the `VITE_BACKEND_URL` value with the backend endpoint.

## Run

### Backend

```bash
npm run start:api
```

### Frontend

```bash
npm run start:ui
```

Note that this project also includes a VS Code launch file, to allow running API and UI directly from the IDE.

## Development

### Linting and formatting

The project is configured to be linted and formatted on both the backend and frontend.

If you are using VS Code, we recommend doing the following:
1. Get the prettier-eslint extension.
2. Set the default formatter to the prettier-eslint one.
3. Configure VS Code to format your documents on save.

To manually lint and format, use the following:

```bash
npm run lint
npm run format
```
in both the backend and frontend directories.

## Test

### Backend

```bash
cd backend/
npm run test
```

### Frontend

```bash
cd frontend/
npm run test
```

## Contributing

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Thank you for considering contributing to this open source project!

Please read the our [contributing guide](CONTRIBUTING.md) and our [code of conduct](CODE_OF_CONDUCT.md) before contributing.

## License

[MIT](LICENSE)
