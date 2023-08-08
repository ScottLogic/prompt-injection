const express = require("express");
const router = require("./router");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const { setOpenAiApiKey } = require("./openai");

dotenv.config();

// by default runs on port 3001
const port = process.env.PORT || 3001;

const envOpenAiKey = process.env.OPENAI_API_KEY;

// Creating express server
const app = express();
// for parsing application/json
app.use(express.json());

// use session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
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
  if (!req.session.activeDefences) {
    req.session.activeDefences = [];
  }
  if (!req.session.apiKey) {
    req.session.apiKey = envOpenAiKey || "";
  }
  next();
});

app.use("/", router);
app.listen(port, () => {
  console.log("Server is running on port: " + port);

  // for dev purposes only - set the API key from the environment variable
  if (envOpenAiKey) {
    console.debug("Initializing models with API key from environment variable");
    setOpenAiApiKey({ apiKey: "" }, process.env.OPENAI_API_KEY);
  }
});
