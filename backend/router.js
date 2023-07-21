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

// Applys the active defence transformations to input prompt
router.post("/defence/transform", (req, res, next) => {
  const message = req.body?.message;
  res.send(transformMessage(message, req.session.activeDefences));
});

// Get sent emails
router.get("/email/get", (req, res, next) => {
  res.send(req.session.sentEmails);
});

// Chat to ChatGPT
router.post("/openai/chat", async (req, res, next) => {
  const message = req.body?.message;
  if (message) {
    // see if this message triggers any defences
    let reply = detectTriggeredDefences(message, req.session.activeDefences);
    if (!reply.defenceInfo.blocked) {
      const defenceInfo = reply.defenceInfo;
      // get the chatGPT reply
      try {
        reply = await chatGptSendMessage(message, req.session);
        // combine triggered defences
        reply.defenceInfo.triggeredDefences = [
          ...defenceInfo.triggeredDefences,
          ...reply.defenceInfo.triggeredDefences,
        ];
      } catch (error) {
        console.log(error);
        res.statusCode = 500;
        res.send("Failed to get chatGPT reply");
        return;
      }
    }
    console.log(reply);
    res.send(reply);
  } else {
    res.statusCode = 400;
    res.send("Missing message");
  }
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req, res, next) => {
  req.session.chatHistory = [];
  res.send("ChatGPT messages cleared");
});

// Importing the router
module.exports = router;
