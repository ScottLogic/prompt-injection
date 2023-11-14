import express from "express";
import { ChatModelConfiguration, MODEL_CONFIG } from "./models/chat";
import { Document } from "./models/document";
import { verifyKeySupportsModel } from "./openai";
import { LEVEL_NAMES } from "./models/level";
import * as fs from "fs";
import { OpenAiSetModelRequest } from "./models/api/OpenAiSetModelRequest";
import { OpenAiConfigureModelRequest } from "./models/api/OpenAiConfigureModelRequest";
import {
  systemRoleLevel1,
  systemRoleLevel2,
  systemRoleLevel3,
} from "./promptTemplates";
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
router.post("/openai/model", async (req: OpenAiSetModelRequest, res) => {
  const { model } = req.body;

  if (model === undefined) {
    res.status(400).send();
  } else {
    try {
      // Verify model is valid for our key (it should be!)
      await verifyKeySupportsModel(model);
      // Keep same config if not given in request.
      const configuration =
        req.body.configuration ?? req.session.chatModel.configuration;
      req.session.chatModel = { id: model, configuration };
      console.debug("GPT model set:", JSON.stringify(req.session.chatModel));
      res.status(200).send();
    } catch (err) {
      console.log("GPT model could not be set: ", err);
      res.status(401).send();
    }
  }
});

function updateConfigProperty(
  config: ChatModelConfiguration,
  configId: MODEL_CONFIG,
  value: number,
  max: number
): ChatModelConfiguration | null {
  if (value >= 0 && value <= max) {
    config[configId] = value;
    return config;
  }
  return null;
}

router.post(
  "/openai/model/configure",
  (req: OpenAiConfigureModelRequest, res) => {
    const configId = req.body.configId as MODEL_CONFIG | undefined;
    const value = req.body.value;

    let updated = null;

    if (configId && value && value >= 0) {
      const lastConfig = req.session.chatModel.configuration;
      switch (configId) {
        case MODEL_CONFIG.TEMPERATURE:
          updated = updateConfigProperty(lastConfig, configId, value, 2);
          break;
        case MODEL_CONFIG.TOP_P:
          updated = updateConfigProperty(lastConfig, configId, value, 1);
          break;
        case MODEL_CONFIG.FREQUENCY_PENALTY:
          updated = updateConfigProperty(lastConfig, configId, value, 2);
          break;
        case MODEL_CONFIG.PRESENCE_PENALTY:
          updated = updateConfigProperty(lastConfig, configId, value, 2);
          break;
        default:
          res.status(400).send();
      }
      if (updated) {
        req.session.chatModel.configuration = updated;
        res.status(200).send();
      } else {
        res.status(400).send();
      }
    }
  }
);

router.get("/openai/model", (req, res) => {
  res.send(req.session.chatModel);
});

// /level/prompt?level=1
router.get("/level/prompt", (req, res) => {
  const levelStr: string | undefined = req.query.level as string | undefined;
  if (levelStr === undefined) {
    res.status(400).send();
  } else {
    const level = parseInt(levelStr) as LEVEL_NAMES;
    switch (level) {
      case LEVEL_NAMES.LEVEL_1:
        res.send(systemRoleLevel1);
        break;
      case LEVEL_NAMES.LEVEL_2:
        res.send(systemRoleLevel2);
        break;
      case LEVEL_NAMES.LEVEL_3:
        res.send(systemRoleLevel3);
        break;
      default:
        res.status(400).send();
        break;
    }
  }
});

router.get("/documents", (_, res) => {
  const docFiles: Document[] = [];

  fs.readdir("resources/documents/common", (err, files) => {
    if (err) {
      res.status(500).send("Failed to read documents");
      return;
    }
    files.forEach((file) => {
      const fileType = file.split(".").pop() ?? "";
      docFiles.push({
        filename: file,
        filetype: fileType === "csv" ? "text/csv" : fileType,
      });
    });
    res.send(docFiles);
  });
});

export { router };
