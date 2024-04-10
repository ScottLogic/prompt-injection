# ![SpyLogic Avatar](./frontend/src/assets/images/BotAvatarDefault.svg) Welcome to SpyLogic

## Introduction

Welcome to the open source Scott Logic prompt injection playground!

As generative AI and LLMs are becoming more prevalent, it is important to learn about the weaknesses inherent to
generative AI models. We have built an application called **SpyLogic** to teach people in a fun way about prompt
injection attacks, and how to defend against them.

SpyLogic is presented in two modes:

### Story mode

Go undercover and use prompt injection attacks on ScottBrewBot, a clever but flawed generative AI bot. Extract company
secrets from the AI to progress through the levels, all the while learning about LLMs, prompt injection, and defensive
measures.

### Sandbox mode

Activate and configure a number of different prompt injection defence measures to create your own security system. Then
talk to the AI and try to crack it!

## OpenAI

This app is build using the OpenAI API. To use it you will need to have an [OpenAI](https://openai.com/) account, and that account must have credit! You can check your credit on the [billing page](https://platform.openai.com/account/billing/overview).

$5 of credit is issued to every new free acount, however this expires after 3 months ([true in July 2023](https://community.openai.com/t/does-even-today-openai-provides-free-api-credits/289938)). Note: When you verify a new account, you do so with a phone number. To gain free credits, you will need to use a phone number that has not yet verified an account. See [OpenAI Pricing](https://openai.com/pricing) for more information.

## Installation

Minimum requirement: Node v18

```bash
npm ci
```

## Setup Local Environment

To run locally, a few environment variables must be defined. We are using [dotenv](https://github.com/motdotla/dotenv)
to load local `.env` files.

_Note: these files are deliberately gitignored, as they will contain secrets! Never commit them._

### API

1. In the backend directory, copy file [.env.example](backend/.env.example) and name the copy `.env`, then open for
   editing
2. Set value of `OPENAI_API_KEY` to your [OpenAI API key](https://platform.openai.com/account/api-keys)
3. Set value of `SESSION_SECRET` to a [random UUID](https://www.uuidgenerator.net/)

### UI

1. In the frontend directory, copy file [.env.example](frontend/.env.example) and name the copy `.env`
2. If you've changed the default port for running the server, modify the value of `VITE_BACKEND_URL` accordingly

## Run

### Local

It is easiest to host both API and UI through the server. From project root:

```bash
npm run build
npm start
```

Alternatively, to run in Docker we have provided a [Compose file](./compose.yaml) and npm scripts for convenience:

```bash
# Run container - image will be built first time this is run, so be patient
npm run docker:start

# Tail the server logs
npm run docker:logs

# Stop the container
npm run docker:stop
```

In either case you will need the `backend/.env` file, as mentioned above.

### Remote

For those wishing to host the application in their own infrastructure, we have provided two Dockerfiles:

1. [Dockerfile](./backend/Dockerfile) in the backend directory will generate an image for running just the API. If you
   intend to deploy to the cloud, this is the one to use.
2. [prodlite.Dockerfile](./prodlite.Dockerfile) in the root directory will generate an image hosting UI and API from the
   same server, for convenience. This will get you up and running as quickly as possible.

In either case, you will need to provide environment vars `OPENAI_API_KEY` and `SESSION_SECRET` (as described in
[Setup Environment](#setup-local-environment) above).

Please note server-side session storage is currently in-memory, so if you wish to scale the API you will either need to
enable sticky load-balancing, or, modify the code to use a shared storage solution - refer to
[Express-Session](https://www.npmjs.com/package/express-session#compatible-session-stores) for the various options.

## Develop

For all the hot reloading and React DevTools comforts, you'll want to run UI and API separately in dev mode.
See the [frontend](frontend/README.md) and [backend](backend/README.md) READMEs for instructions.

## Contributing

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Thank you for considering contributing to this open source project!

Please read the our [contributing guide](CONTRIBUTING.md) and our [code of conduct](CODE_OF_CONDUCT.md) first.

## License

[MIT](LICENSE)
