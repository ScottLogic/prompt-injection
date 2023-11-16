import { join } from "node:path";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import memoryStoreFactory from "memorystore";

import { defaultDefences } from "./defaultDefences";
import { ChatHistoryMessage, ChatModel, defaultChatModel } from "./models/chat";
import { DefenceInfo } from "./models/defence";
import { EmailInfo } from "./models/email";
import { LEVEL_NAMES } from "./models/level";
import { router } from "./router";

dotenv.config();

declare module "express-session" {
  interface Session {
    initialised: boolean;
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
    // add empty states for levels 0-3
    req.session.levelState = Object.values(LEVEL_NAMES)
      .filter((value) => Number.isNaN(Number(value)))
      .map((value) => ({
        level: value as LEVEL_NAMES,
        chatHistory: [],
        defences: defaultDefences,
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
  express.static(join(__dirname, "../resources/documents/common"))
);

export default app;
