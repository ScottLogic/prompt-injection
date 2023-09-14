import express from "express";

import {
  activateDefence,
  deactivateDefence,
  configureDefence,
  transformMessage,
  detectTriggeredDefences,
  getInitialDefences,
} from "./defence";
import {
  CHAT_MESSAGE_TYPE,
  ChatHttpResponse,
  ChatModelConfiguration,
  MODEL_CONFIG,
} from "./models/chat";
import { Document } from "./models/document";
import { chatGptSendMessage, setOpenAiApiKey, setGptModel } from "./openai";
import { PHASE_NAMES } from "./models/phase";
import * as fs from "fs";
import { DefenceActivateRequest } from "./models/api/DefenceActivateRequest";
import { DefenceConfigureRequest } from "./models/api/DefenceConfigureRequest";
import { EmailClearRequest } from "./models/api/EmailClearRequest";
import { DefenceResetRequest } from "./models/api/DefenceResetRequest";
import { OpenAiChatRequest } from "./models/api/OpenAiChatRequest";
import { OpenAiAddHistoryRequest } from "./models/api/OpenAiAddHistoryRequest";
import { OpenAiClearRequest } from "./models/api/OpenAiClearRequest";
import { OpenAiSetKeyRequest } from "./models/api/OpenAiSetKeyRequest";
import { OpenAiSetModelRequest } from "./models/api/OpenAiSetModelRequest";
import { OpenAiConfigureModelRequest } from "./models/api/OpenAiConfigureModelRequest";

const router = express.Router();

// Activate a defence
router.post("/defence/activate", (req: DefenceActivateRequest, res) => {
  // id of the defence
  const defenceId = req.body.defenceId;
  const phase = req.body.phase;
  if (defenceId && phase) {
    // activate the defence
    req.session.phaseState[phase].defences = activateDefence(
      defenceId,
      req.session.phaseState[phase].defences
    );
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Deactivate a defence
router.post("/defence/deactivate", (req: DefenceActivateRequest, res) => {
  // id of the defence
  const defenceId = req.body.defenceId;
  const phase = req.body.phase;
  if (defenceId && phase) {
    // deactivate the defence
    req.session.phaseState[phase].defences = deactivateDefence(
      defenceId,
      req.session.phaseState[phase].defences
    );
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Configure a defence
router.post("/defence/configure", (req: DefenceConfigureRequest, res) => {
  // id of the defence
  const defenceId = req.body.defenceId;
  const config = req.body.config;
  const phase = req.body.phase;
  if (defenceId && config && phase && phase >= PHASE_NAMES.PHASE_0) {
    // configure the defence
    req.session.phaseState[phase].defences = configureDefence(
      defenceId,
      req.session.phaseState[phase].defences,
      config
    );
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// reset the active defences
router.post("/defence/reset", (req: DefenceResetRequest, res) => {
  const phase = req.body.phase;
  if (phase !== undefined && phase >= PHASE_NAMES.PHASE_0) {
    req.session.phaseState[phase].defences = getInitialDefences();
    console.debug("Defences reset");
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Get the status of all defences /defence/status?phase=1
router.get("/defence/status", (req, res) => {
  const phase: number | undefined = req.query.phase as number | undefined;
  if (phase !== undefined) {
    res.send(req.session.phaseState[phase].defences);
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// Get sent emails /email/get?phase=1
router.get("/email/get", (req, res) => {
  const phase: number | undefined = req.query.phase as number | undefined;
  if (phase !== undefined) {
    res.send(req.session.phaseState[phase].sentEmails);
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// clear emails
router.post("/email/clear", (req: EmailClearRequest, res) => {
  const phase = req.body.phase;
  if (phase !== undefined && phase >= PHASE_NAMES.PHASE_0) {
    req.session.phaseState[phase].sentEmails = [];
    console.debug("Emails cleared");
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Chat to ChatGPT
router.post("/openai/chat", async (req: OpenAiChatRequest, res) => {
  // set reply params
  const chatResponse: ChatHttpResponse = {
    reply: "",
    defenceInfo: {
      blockedReason: "",
      isBlocked: false,
      alertedDefences: [],
      triggeredDefences: [],
    },
    numPhasesCompleted: req.session.numPhasesCompleted,
    transformedMessage: "",
    wonPhase: false,
  };

  const message = req.body.message;
  const currentPhase = req.body.currentPhase;

  // must have initialised openai
  if (!req.session.openAiApiKey) {
    res.statusCode = 401;
    chatResponse.defenceInfo.isBlocked = true;
    chatResponse.defenceInfo.blockedReason =
      "Please enter a valid OpenAI API key to chat to me!";
    console.error(chatResponse.reply);
  } else if (message === undefined || currentPhase === undefined) {
    res.statusCode = 400;
    chatResponse.defenceInfo.isBlocked = true;
    chatResponse.defenceInfo.blockedReason =
      "Please send a message and current phase to chat to me!";
  } else {
    let numPhasesCompleted = req.session.numPhasesCompleted;

    if (message) {
      chatResponse.transformedMessage = message;
      // see if this message triggers any defences (only for phase 2 and sandbox)
      if (
        currentPhase === PHASE_NAMES.PHASE_2 ||
        currentPhase === PHASE_NAMES.SANDBOX
      ) {
        chatResponse.defenceInfo = await detectTriggeredDefences(
          message,
          req.session.phaseState[currentPhase].defences,
          req.session.openAiApiKey
        );
        // if message is blocked, add to chat history (not as completion)
        if (chatResponse.defenceInfo.isBlocked) {
          req.session.phaseState[currentPhase].chatHistory.push({
            completion: null,
            chatMessageType: CHAT_MESSAGE_TYPE.USER,
            infoMessage: message,
          });
        }
      }
      // if blocked, send the response
      if (!chatResponse.defenceInfo.isBlocked) {
        // transform the message according to active defences
        chatResponse.transformedMessage = transformMessage(
          message,
          req.session.phaseState[currentPhase].defences
        );
        // if message has been transformed then add the original to chat history and send transformed to chatGPT
        const messageIsTransformed =
          chatResponse.transformedMessage !== message;
        if (messageIsTransformed) {
          req.session.phaseState[currentPhase].chatHistory.push({
            completion: null,
            chatMessageType: CHAT_MESSAGE_TYPE.USER,
            infoMessage: message,
          });
        }
        // get the chatGPT reply
        try {
          const openAiReply = await chatGptSendMessage(
            req.session.phaseState[currentPhase].chatHistory,
            req.session.phaseState[currentPhase].defences,
            req.session.chatModel,
            chatResponse.transformedMessage,
            messageIsTransformed,
            req.session.openAiApiKey,
            req.session.phaseState[currentPhase].sentEmails,
            currentPhase
          );

          if (openAiReply) {
            chatResponse.wonPhase = openAiReply.wonPhase;
            chatResponse.reply = openAiReply.completion.content ?? "";

            // combine triggered defences
            chatResponse.defenceInfo.triggeredDefences = [
              ...chatResponse.defenceInfo.triggeredDefences,
              ...openAiReply.defenceInfo.triggeredDefences,
            ];
            // combine blocked
            chatResponse.defenceInfo.isBlocked =
              openAiReply.defenceInfo.isBlocked;

            // combine blocked reason
            chatResponse.defenceInfo.blockedReason =
              openAiReply.defenceInfo.blockedReason;
          }
        } catch (error) {
          res.statusCode = 500;
          console.log(error);
          if (error instanceof Error) {
            chatResponse.reply = "Failed to get chatGPT reply";
          }
        }
      }

      // if the reply was blocked then add it to the chat history
      if (chatResponse.defenceInfo.isBlocked) {
        req.session.phaseState[currentPhase].chatHistory.push({
          completion: null,
          chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
          infoMessage: chatResponse.defenceInfo.blockedReason,
        });
      }

      // enable next phase when user wins current phase
      if (chatResponse.wonPhase) {
        console.log("Win conditon met for phase: ", currentPhase);
        numPhasesCompleted = currentPhase + 1;
        req.session.numPhasesCompleted = numPhasesCompleted;
        chatResponse.numPhasesCompleted = numPhasesCompleted;
      }
    } else {
      res.statusCode = 400;
      chatResponse.reply = "Missing message";
      console.error(chatResponse.reply);
    }
  }
  // log and send the reply with defence info
  console.log(chatResponse);
  res.send(chatResponse);
});

// get the chat history
router.get("/openai/history", (req, res) => {
  const phase: number | undefined = req.query.phase as number | undefined;
  if (phase !== undefined) {
    res.send(req.session.phaseState[phase].chatHistory);
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// add an info message to chat history
router.post("/openai/addHistory", (req: OpenAiAddHistoryRequest, res) => {
  const message = req.body.message;
  const chatMessageType = req.body.chatMessageType;
  const phase = req.body.phase;
  if (message && chatMessageType && phase && phase >= PHASE_NAMES.PHASE_0) {
    req.session.phaseState[phase].chatHistory.push({
      completion: null,
      chatMessageType: chatMessageType,
      infoMessage: message,
    });
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req: OpenAiClearRequest, res) => {
  const phase = req.body.phase;
  if (phase !== undefined && phase >= PHASE_NAMES.PHASE_0) {
    req.session.phaseState[phase].chatHistory = [];
    console.debug("ChatGPT messages cleared");
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Set API key
router.post("/openai/apiKey", async (req: OpenAiSetKeyRequest, res) => {
  const openAiApiKey = req.body.openAiApiKey;
  if (!openAiApiKey) {
    res.status(401).send();
    return;
  }
  if (await setOpenAiApiKey(openAiApiKey, req.session.chatModel.id)) {
    req.session.openAiApiKey = openAiApiKey;
    res.send();
  } else {
    res.status(401).send();
  }
});

// Get API key
router.get("/openai/apiKey", (req, res) => {
  res.send(req.session.openAiApiKey);
});

// Set the ChatGPT model
router.post("/openai/model", async (req: OpenAiSetModelRequest, res) => {
  const model = req.body.model;
  const config = req.body.configuration;

  if (model === undefined) {
    res.status(400).send();
  } else if (!req.session.openAiApiKey) {
    res.status(401).send();
  } else if (await setGptModel(req.session.openAiApiKey, model)) {
    if (config) {
      req.session.chatModel = { id: model, configuration: config };
    } else {
      // change model but keep configs
      req.session.chatModel = {
        id: model,
        configuration: req.session.chatModel.configuration,
      };
    }
    console.debug("set GPT model", JSON.stringify(req.session.chatModel));
    res.status(200).send();
  } else {
    res.status(401).send();
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
        console.debug(
          "Updated model config",
          JSON.stringify(req.session.chatModel.configuration)
        );
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

router.get("/phase/completed", (req, res) => {
  res.send(req.session.numPhasesCompleted.toString());
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
