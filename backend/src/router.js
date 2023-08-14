const express = require("express");
const {
  activateDefence,
  deactivateDefence,
  configureDefence,
  transformMessage,
  detectTriggeredDefences,
} = require("./defence");
const {
  chatGptSendMessage,
  setOpenAiApiKey,
  setGptModel,
} = require("./openai");
const { initQAModel } = require("./langchain");
const router = express.Router();

// keep track of phase change to reinitialze models
let prevPhase = 3;

// Activate a defence
router.post("/defence/activate", (req, res, next) => {
  // id of the defence
  const defenceId = req.body?.defenceId;
  if (defenceId) {
    // activate the defence
    req.session.defences = activateDefence(defenceId, req.session.defences);
    res.send("Defence activated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Deactivate a defence
router.post("/defence/deactivate", (req, res, next) => {
  // id of the defence
  const defenceId = req.body?.defenceId;
  if (defenceId) {
    // deactivate the defence
    req.session.defences = deactivateDefence(defenceId, req.session.defences);
    res.send("Defence deactivated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Configure a defence
router.post("/defence/configure", (req, res, next) => {
  // id of the defence
  const defenceId = req.body?.defenceId;
  const config = req.body?.config;
  if (defenceId && config) {
    // configure the defence
    req.session.defences = configureDefence(
      defenceId,
      req.session.defences,
      config
    );
    res.send("Defence configured");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId or config");
  }
});

// Get the status of all defences
router.get("/defence/status", (req, res, next) => {
  res.send(req.session.defences);
});

// Get sent emails
router.get("/email/get", (req, res, next) => {
  res.send(req.session.sentEmails);
});

// clear emails
router.post("/email/clear", (req, res, next) => {
  req.session.sentEmails = [];
  res.send("Emails cleared");
});

// Chat to ChatGPT
router.post("/openai/chat", async (req, res, next) => {
  // set reply params
  let reply = "";
  let defenceInfo = { blocked: false, triggeredDefences: [] };
  let transformedMessage = "";
  // parse out the message
  const message = req.body?.message;
  const currentPhase = req.body?.currentPhase;

  // if phase has changed, reinitialize the QA model with with new filepath
  if (prevPhase != currentPhase) {
    prevPhase = currentPhase;
    initQAModel(req.session, currentPhase);
  }

  if (message) {
    transformedMessage = message;
    // see if this message triggers any defences
    const detectReply = detectTriggeredDefences(message, req.session.defences);
    reply = detectReply.reply;
    defenceInfo = detectReply.defenceInfo;
    // if blocked, send the response
    if (!defenceInfo.blocked) {
      // transform the message according to active defences
      transformedMessage = transformMessage(message, req.session.defences);
      // get the chatGPT reply
      try {
        const openAiReply = await chatGptSendMessage(
          transformedMessage,
          req.session,
          currentPhase
        );
        reply = openAiReply.reply;
        // combine triggered defences
        defenceInfo.triggeredDefences = [
          ...defenceInfo.triggeredDefences,
          ...openAiReply.defenceInfo.triggeredDefences,
        ];
        // combine blocked
        defenceInfo.blocked =
          defenceInfo.blocked || openAiReply.defenceInfo.blocked;
      } catch (error) {
        console.log(error);
        if (error.response?.status == 401) {
          res.statusCode = 401;
          reply = "Please enter a valid OpenAI API key to chat to me!";
        } else {
          res.statusCode = 500;
          console.log(error);
          reply = "Failed to get chatGPT reply";
        }
      }
    }
  } else {
    res.statusCode = 400;
    reply = "Missing message";
    console.error(reply);
  }

  // TODO remove, this is just for demonstration purposes
  let numPhasesCompleted = req.session.numPhasesCompleted;
  if (numPhasesCompleted < 3 && currentPhase === numPhasesCompleted) {
    numPhasesCompleted = currentPhase + 1;
    req.session.numPhasesCompleted = numPhasesCompleted;
  }

  // construct response
  const response = {
    reply,
    defenceInfo,
    transformedMessage,
    numPhasesCompleted,
  };
  // log and send the reply with defence info
  console.log(response);
  res.send(response);
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req, res, next) => {
  req.session.chatHistory = [];
  res.send("ChatGPT messages cleared");
});

// Set API key
router.post("/openai/apiKey", async (req, res, next) => {
  const apiKey = req.body?.apiKey;
  if (!apiKey) {
    res.status(401).send("Invalid API key");
    return;
  }
  if (await setOpenAiApiKey(req.session, apiKey)) {
    res.send("API key set");
  } else {
    res.status(401).send("Invalid API key");
  }
});

// Get API key
router.get("/openai/apiKey", (req, res, next) => {
  res.send(req.session.apiKey);
});

// Set the ChatGPT model
router.post("/openai/model", async (req, res, next) => {
  const model = req.body?.model;
  if (model) {
    if (await setGptModel(req.session, model)) {
      res.status(200).send("ChatGPT model set. ");
    } else {
      res.status(401).send("Could not set model");
    }
  }
});

router.get("/openai/model", (req, res, next) => {
  res.send(req.session.gptModel);
});

router.get("/phase/completed", (req, res, next) => {
  res.send(req.session.numPhasesCompleted.toString());
});

module.exports = router;
