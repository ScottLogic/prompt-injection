// Importing express module
const express = require("express");
const { clearEmails, getSentEmails } = require("./email/email");
const { chatGptSendMessage, clearMessages } = require("./openai/openai");
const router = express.Router();

// Handling request using router
router.get("/", (req, res, next) => {
  res.send("Hello world");
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
