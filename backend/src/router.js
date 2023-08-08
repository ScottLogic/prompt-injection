const express = require("express");
const { chatGptSendMessage } = require("./openai");
const router = express.Router();
const {
  activateDefence,
  deactivateDefence,
  configureDefence,
  transformMessage,
  detectTriggeredDefences,
} = require("./defence");

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

// Chat to ChatGPT
router.post("/openai/chat", async (req, res, next) => {
  // set reply params
  let reply = "";
  let defenceInfo = { blocked: false, triggeredDefences: [] };
  let transformedMessage = "";
  // parse out the message
  const message = req.body?.message;
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
          req.session
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
        res.statusCode = 500;
        reply = "Failed to get chatGPT reply";
      }
    }
  } else {
    res.statusCode = 400;
    reply = "Missing message";
    console.error(reply);
  }
  // construct response
  const response = { reply, defenceInfo, transformedMessage };
  // log and send the reply with defence info
  console.log(response);
  res.send(response);
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req, res, next) => {
  req.session.chatHistory = [];
  res.send("ChatGPT messages cleared");
});

// Importing the router
module.exports = router;
