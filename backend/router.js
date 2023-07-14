// Importing express module
const express = require("express");
const {
  activateDefence,
  deactivateDefence,
  isDefenceActive,
} = require("./defence");
const { clearEmails, getSentEmails } = require("./email");
const { chatGptSendMessage, clearMessages } = require("./openai");
const router = express.Router();

// Activate a defence
router.post("/defence/activate", (req, res, next) => {
  // id of the defence
  const defenceId = req.body?.defenceId;
  if (defenceId) {
    // activate the defence
    const defence = activateDefence(defenceId);
    res.send(defence);
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
    const defence = deactivateDefence(defenceId);
    res.send(defence);
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Get the status of a defence
router.get("/defence/status", (req, res, next) => {
  // id of the defence
  const defenceId = req.query?.defenceId;
  if (defenceId) {
    // check if the defence is active
    const isActive = isDefenceActive(defenceId);
    res.send({ isActive });
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Clear sent emails
router.post("/email/clear", (req, res, next) => {
  clearEmails();
  res.send("Sent emails cleared");
});

// Get sent emails
router.get("/email/get", (req, res, next) => {
  res.send(getSentEmails());
});

// Chat to ChatGPT
router.post("/openai/chat", async (req, res, next) => {
  const message = req.body?.message;
  if (message) {
    // get the chatGPT reply
    try {
      const reply = await chatGptSendMessage(message);
      res.send(reply);
    } catch (error) {
      console.log(error);
      res.statusCode = 500;
      res.send("Failed to get chatGPT reply");
    }
  } else {
    res.statusCode = 400;
    res.send("Missing message");
  }
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req, res, next) => {
  clearMessages();
  res.send("ChatGPT messages cleared");
});

// Importing the router
module.exports = router;
