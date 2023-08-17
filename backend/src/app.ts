import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";

import { getInitialDefences } from "./defence";
import { setOpenAiApiKey } from "./openai";
import { router } from "./router";
import { ChatCompletionRequestMessage } from "openai";
import { EmailInfo } from "./models/email";
import { DefenceInfo } from "./models/defence";

dotenv.config();

declare module "express-session" {
  interface Session {
    chatHistory: ChatCompletionRequestMessage[];
    sentEmails: EmailInfo[];
    defences: DefenceInfo[];
    apiKey: string;
    gptModel: string;
    numPhasesCompleted: number;
  }
}

// by default runs on port 3001
const port = process.env.PORT || String(3001);

const envOpenAiKey = process.env.OPENAI_API_KEY;

// use default model
const defaultModel = "gpt-4";

// Creating express server
const app = express();
// for parsing application/json
app.use(express.json());

// use session
const express_session: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "secret",
  name: "prompt-injection.sid",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
  },
};

// serve secure cookies in production
if (app.get("env") === "production") {
  if (!express_session.cookie) {
    express_session.cookie = { secure: true };
  } else {
    express_session.cookie.secure = true;
  }
}
app.use(session(express_session));

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use((req, res, next) => {
  // initialise session variables
  if (!req.session.chatHistory) {
    req.session.chatHistory = [];
  }
  if (!req.session.sentEmails) {
    req.session.sentEmails = [];
  }
  if (!req.session.defences) {
    req.session.defences = getInitialDefences();
  }
  if (!req.session.apiKey) {
    req.session.apiKey = envOpenAiKey || "";
  }
  if (!req.session.gptModel) {
    req.session.gptModel = defaultModel;
  }
  if (!req.session.numPhasesCompleted) {
    req.session.numPhasesCompleted = 0;
  }
  next();
});

app.use("/", router);
app.listen(port, () => {
  console.log("Server is running on port: " + port);

  // for dev purposes only - set the API key from the environment variable
  if (envOpenAiKey) {
    console.debug("Initializing models with API key from environment variable");
    setOpenAiApiKey(envOpenAiKey, defaultModel);
  }
});
