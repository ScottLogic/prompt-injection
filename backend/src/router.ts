import express from "express";
import {
  handleConfigureDefence,
  handleDefenceActivation,
  handleDefenceDeactivation,
  handleGetDefenceStatus,
  handleResetAllDefences,
  handleResetSingleDefence,
} from "./controller/defenceController";
import {
  handleClearEmails,
  handleGetEmails,
} from "./controller/emailController";
import {
  handleAddToChatHistory,
  handleChatToGPT,
  handleClearChatHistory,
  handleGetChatHistory,
} from "./controller/chatController";
import {
  handleConfigureModel,
  handleGetModel,
  handleSetModel,
} from "./controller/modelController";
import { handleGetDocuments } from "./controller/documentController";
import { handleGetLevelPrompt } from "./controller/levelController";

const router = express.Router();

// Activate a defence
router.post("/defence/activate", handleDefenceActivation);

// Deactivate a defence
router.post("/defence/deactivate", handleDefenceDeactivation);

// Configure a defence
router.post("/defence/configure", handleConfigureDefence);

// reset the active defences
router.post("/defence/reset", handleResetAllDefences);

// reset one defence config and return the new config
router.post("/defence/resetConfig", handleResetSingleDefence);

// Get the status of all defences
router.get("/defence/status", handleGetDefenceStatus);

// Get sent emails /email/get?level=1
router.get("/email/get", handleGetEmails);

// clear emails
router.post("/email/clear", handleClearEmails);

// Chat to ChatGPT
router.post("/openai/chat", handleChatToGPT);

// get the chat history
router.get("/openai/history", handleGetChatHistory);

// add an info message to chat history
router.post("/openai/addHistory", handleAddToChatHistory);

// Clear the ChatGPT messages
router.post("/openai/clear", handleClearChatHistory);

// Set the ChatGPT model
router.post("/openai/model", handleSetModel);

// configure the model parameters
router.post("/openai/model/configure", handleConfigureModel);

// get the current model
router.get("/openai/model", handleGetModel);

// get the prompt for the given level
router.get("/level/prompt", handleGetLevelPrompt);

router.get("/documents", handleGetDocuments);

export { router };
