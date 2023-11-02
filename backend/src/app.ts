import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import memoryStoreFactory from "memorystore";
import session from "express-session";

import { router } from "./router";
import { ChatHistoryMessage, ChatModel } from "./models/chat";
import { EmailInfo } from "./models/email";
import { DefenceInfo } from "./models/defence";
import { defaultChatModel } from "./models/chat";
import { LEVEL_NAMES } from "./models/level";
import path from "path";
import { getInitialDefences } from "./defence";

dotenv.config();

declare module "express-session" {
  interface Session {
    initialised: boolean;
    openAiApiKey: string | null;
    chatModel: ChatModel;
    levelState: LevelState[];
  }
  interface LevelState {
    level: LEVEL_NAMES;
    chatHistory: ChatHistoryMessage[];
    defences: DefenceInfo[];
    sentEmails: EmailInfo[];
  }
}

const app = express();
const isProd = app.get("env") === "production";

// for parsing application/json
app.use(express.json());

// use session storage - currently in-memory, but in future use Redis in prod builds
const maxAge = 60 * 60 * 1000 * (isProd ? 1 : 8); //1 hour in prod, 8hrs in dev
const sessionOpts: session.SessionOptions = {
  store: new (memoryStoreFactory(session))({
    checkPeriod: maxAge,
  }),
  secret: process.env.SESSION_SECRET ?? "secret",
  name: "prompt-injection.sid",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProd,
    maxAge,
  },
};

app.use(session(sessionOpts));

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use((req, _res, next) => {
  // initialise session variables first time
  if (!req.session.initialised) {
    req.session.chatModel = defaultChatModel;
    req.session.openAiApiKey = process.env.OPENAI_API_KEY ?? null;
    // add empty states for levels 0-3
    req.session.levelState = Object.values(LEVEL_NAMES)
      .filter((value) => Number.isNaN(Number(value)))
      .map((value) => ({
        level: value as LEVEL_NAMES,
        chatHistory: [],
        defences: getInitialDefences(),
        sentEmails: [],
      }));
    req.session.initialised = true;
  }
  next();
});

app.use("/", router);

// serve the documents folder
app.use(
  "/documents",
  express.static(path.join(__dirname, "../resources/documents/common"))
);

export default app;
