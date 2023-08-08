const express = require("express");
const router = require("./router");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const { initOpenAi } = require("./openai");
const { initQAModel, initPromptEvaluationModel } = require("./langchain");

dotenv.config();

// by default runs on port 3001
const port = process.env.PORT || 3001;

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

// main model for chat 
initOpenAi();

// model for question answering of documenents
initQAModel();

// model for LLM prompt evaluation
initPromptEvaluationModel();

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

  next();
});

app.use("/", router);
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
