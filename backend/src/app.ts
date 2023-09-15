import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";

import { setOpenAiApiKey } from "./openai";
import { router } from "./router";
import { ChatHistoryMessage, ChatModel } from "./models/chat";
import { EmailInfo } from "./models/email";
import { DefenceInfo } from "./models/defence";
import { defaultChatModel } from "./models/chat";
import { LEVEL_NAMES } from "./models/level";
import path from "path";
import { getInitialDefences } from "./defence";
import { initDocumentVectors } from "./langchain";

dotenv.config();

declare module "express-session" {
  interface Session {
    initialised: boolean;
    openAiApiKey: string | null;
    chatModel: ChatModel;
    levelState: LevelState[];
    numLevelsCompleted: number;
  }
  interface LevelState {
    level: LEVEL_NAMES;
    chatHistory: ChatHistoryMessage[];
    defences: DefenceInfo[];
    sentEmails: EmailInfo[];
  }
}

// by default runs on port 3001
const port = process.env.PORT ?? String(3001);

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
    req.session.chatModel = defaultChatModel;
    req.session.numLevelsCompleted = 3;
    req.session.openAiApiKey = process.env.OPENAI_API_KEY ?? null;
    req.session.levelState = [];
    // add empty states for levels 0-3
    Object.values(LEVEL_NAMES).forEach((value) => {
      if (isNaN(Number(value))) {
        req.session.levelState.push({
          level: value as LEVEL_NAMES,
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

  // initialise the documents on app startup
  initDocumentVectors()
    .then(() => {
      console.debug("Document vectors initialised");
    })
    .catch((err) => {
      console.error("Error initialising document vectors", err);
    });

  // for dev purposes only - set the API key from the environment variable
  const envOpenAiKey = process.env.OPENAI_API_KEY;
  if (envOpenAiKey) {
    console.debug("Initializing models with API key from environment variable");
    // asynchronously set the API key
    void setOpenAiApiKey(envOpenAiKey, defaultChatModel.id).then(() => {
      console.debug("OpenAI models initialized");
    });
  }
});

// serve the documents folder
app.use(
  "/documents",
  express.static(path.join(__dirname, "../resources/documents/common"))
);
