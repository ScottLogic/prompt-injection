const express = require("express");
const router = require("./router");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const { setOpenAiApiKey } = require("./openai");
const { getInitialDefences } = require("./defence");

dotenv.config();

// by default runs on port 3001
const port = process.env.PORT || 3001;

const envOpenAiKey = process.env.OPENAI_API_KEY;

// use default model
const defaultModel = "gpt-4";

// Creating express server
const app = express();
// for parsing application/json
app.use(express.json());

// use session
const sess = {
  secret: process.env.SESSION_SECRET,
  name: "prompt-injection.sid",
  resave: false,
  saveUninitialized: true,
  cookie: {},
};

// serve secure cookies in production
if (app.get("env") === "production") {
  sess.cookie.secure = true;
}
app.use(session(sess));

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(function (req, res, next) {
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
    const defaultSession = { apiKey: "", gptModel: defaultModel };
    setOpenAiApiKey(defaultSession, process.env.OPENAI_API_KEY);
  }
});
