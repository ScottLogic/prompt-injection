# prompt-injection
Application which investigates defensive measures against prompt injection attacks on an LLM, with a focus on the exposure of external tools.

## Install
### Project and Backend
```
npm install
```
### Frontend
```
cd frontend/
npm install
```

## Setup
Copy the example environment file `.env.exmaple` and rename it to `.env`.

Copy your OpenAI API key into the `.env` file. 

## Deploy
This project includes a VS Code launch file, so the project can be deployed from there if VS Code is used. Otherwise the code can be run manually:
### Backend
```
node backend/app.js
```
### Frontend
```
cd frontend/
npm start
```
