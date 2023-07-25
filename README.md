# prompt-injection

Application which investigates defensive measures against prompt injection attacks on an LLM, with a focus on the exposure of external tools.

## Install

### Backend

```
cd backend/
npm install
```

### Frontend

```
cd frontend/
npm install
```

## Setup

Copy the example environment file `.env.example` and rename it to `.env`.

Copy your [OpenAI API key](https://platform.openai.com/account/api-keys) into the `.env` file.

## Deploy

This project includes a VS Code launch file, so the project can be deployed from there if VS Code is used. Otherwise the code can be run manually:

### Backend

```
cd backend/
node app.js
```

### Frontend

```
cd frontend/
npm start
```
