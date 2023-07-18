// Importing express module
const express = require("express");
const {
  activateDefence,
  deactivateDefence,
  getDefences,
  transformMessage,
  detectTriggeredDefences, 
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

// Get the status of all defences
router.get("/defence/status", (req, res, next) => {
  res.send(getDefences());
});

// Applys the active defence transformations to input prompt
router.post("/defence/transform", (req, res, next) => {
  const message = req.body?.message;
  res.send(transformMessage(message));
  }); 

// Get the status of all defences
router.post("/defence/detect", (req, res, next) => {
  const message = req.body?.message;
  console.log("message: " + message);
  res.send(detectTriggeredDefences(message));
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
      console.log(reply);
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
