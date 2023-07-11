// Importing express module
const express = require("express");
const { chatGptSendMessage } = require("./openai/openai");
const router = express.Router();

// Handling request using router
router.get("/", (req, res, next) => {
  res.send("Hello world");
});

// Chat to ChatGPT
router.post("/chat", async (req, res, next) => {
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

// Importing the router
module.exports = router;
