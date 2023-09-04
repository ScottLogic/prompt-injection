import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";

import { setOpenAiApiKey } from "./openai";
import { router } from "./router";
import { ChatHistoryMessage } from "./models/chat";
import { EmailInfo } from "./models/email";
import { DefenceInfo } from "./models/defence";
import { CHAT_MODELS } from "./models/chat";
import { PHASE_NAMES } from "./models/phase";
import { retrievalQAPrePrompt } from "./promptTemplates";
import path from "path";
import { getInitialDefences } from "./defence";

dotenv.config();

declare module "express-session" {
  interface Session {
    initialised: boolean;
    openAiApiKey: string | null;
    gptModel: CHAT_MODELS;
    phaseState: PhaseState[];
    numPhasesCompleted: number;
  }
  interface PhaseState {
    phase: PHASE_NAMES;
    chatHistory: ChatHistoryMessage[];
    defences: DefenceInfo[];
    sentEmails: EmailInfo[];
  }
}

// by default runs on port 3001
const port = process.env.PORT ?? String(3001);
// use default model
const defaultModel = CHAT_MODELS.GPT_4;

// Creating express server
const app = express();
// for parsing application/json
app.use(express.json());

// use session
const express_session: session.SessionOptions = {
  secret: process.env.SESSION_SECRET ?? "secret",
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

app.use((req, _res, next) => {
  // initialise session variables
  if (!req.session.initialised) {
    req.session.gptModel = defaultModel;
    req.session.numPhasesCompleted = 0;
    req.session.openAiApiKey = process.env.OPENAI_API_KEY ?? null;
    req.session.phaseState = [];
    // add empty states for phases 0-3
    Object.values(PHASE_NAMES).forEach((value) => {
      if (isNaN(Number(value))) {
        req.session.phaseState.push({
          phase: value as PHASE_NAMES,
          chatHistory: [],
          defences: getInitialDefences(),
          sentEmails: [],
        });
      }
    });
    req.session.initialised = true;
  }
  next();
});

app.use("/", router);
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);

  // for dev purposes only - set the API key from the environment variable
  const envOpenAiKey = process.env.OPENAI_API_KEY;
  const prePrompt = retrievalQAPrePrompt;
  if (envOpenAiKey) {
    console.debug("Initializing models with API key from environment variable");
    // asynchronously set the API key
    void setOpenAiApiKey(envOpenAiKey, defaultModel, prePrompt).then(() => {
      console.debug("OpenAI models initialized");
    });
  }
});

// serve the documents folder
app.use(
  "/documents",
  express.static(path.join(__dirname, "../resources/documents/common"))
);
