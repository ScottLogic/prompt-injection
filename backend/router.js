// Importing express module
const express = require("express");
const {
  activateDefence,
  deactivateDefence,
  transformMessage,
  detectTriggeredDefences,
} = require("./defence");
const { chatGptSendMessage } = require("./openai");
const router = express.Router();

// Activate a defence
router.post("/defence/activate", (req, res, next) => {
  // id of the defence
  const defenceId = req.body?.defenceId;
  if (defenceId) {
    // activate the defence
    req.session.activeDefences = activateDefence(
      defenceId,
      req.session.activeDefences
    );
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
    req.session.activeDefences = deactivateDefence(
      defenceId,
      req.session.activeDefences
    );
    res.send("Defence deactivated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Get the status of all defences
router.get("/defence/status", (req, res, next) => {
  res.send(req.session.activeDefences);
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
    const detectReply = detectTriggeredDefences(
      message,
      req.session.activeDefences
    );
    reply = detectReply.reply;
    defenceInfo = detectReply.defenceInfo;
    // if blocked, send the response
    if (!defenceInfo.blocked) {
      // transform the message according to active defences
      transformedMessage = transformMessage(
        message,
        req.session.activeDefences
      );
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
