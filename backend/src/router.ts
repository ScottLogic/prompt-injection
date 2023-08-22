import express from "express";

import {
  activateDefence,
  deactivateDefence,
  configureDefence,
  transformMessage,
  detectTriggeredDefences,
  getQALLMprePrompt,
  getInitialDefences,
} from "./defence";
import { initQAModel } from "./langchain";
import { CHAT_MODELS, ChatHttpResponse } from "./models/chat";
import { DefenceConfig } from "./models/defence";
import { chatGptSendMessage, setOpenAiApiKey, setGptModel } from "./openai";
import { retrievalQAPrePrompt } from "./promptTemplates";
import { PHASE_NAMES } from "./models/phase";

const router = express.Router();

// keep track of phase change to reinitialize models
let prevPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX;

// Activate a defence
router.post("/defence/activate", (req, res) => {
  // id of the defence
  const defenceId: string = req.body?.defenceId;
  if (defenceId) {
    // activate the defence
    req.session.defences = activateDefence(defenceId, req.session.defences);

    // need to re-initialize QA model when turned on
    if (defenceId === "QA_LLM_INSTRUCTIONS") {
      console.debug(
        "Activating qa llm instruction defence - reinitializing qa model"
      );
      initQAModel(req.session.apiKey, getQALLMprePrompt(req.session.defences));
    }

    res.send("Defence activated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Deactivate a defence
router.post("/defence/deactivate", (req, res) => {
  // id of the defence
  const defenceId: string = req.body?.defenceId;
  if (defenceId) {
    // deactivate the defence
    req.session.defences = deactivateDefence(defenceId, req.session.defences);

    if (defenceId === "QA_LLM_INSTRUCTIONS") {
      console.debug("Resetting QA model with default prompt");
      initQAModel(req.session.apiKey, getQALLMprePrompt(req.session.defences));
    }
    res.send("Defence deactivated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId");
  }
});

// Configure a defence
router.post("/defence/configure", (req, res) => {
  // id of the defence
  const defenceId: string = req.body?.defenceId;
  const config: DefenceConfig[] = req.body?.config;
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

// reset the active defences
router.post("/defence/reset", (req, res) => {
  req.session.defences = getInitialDefences();
  console.debug("Defences reset");
  res.send("Defences reset");
});

// Get the status of all defences
router.get("/defence/status", (req, res) => {
  res.send(req.session.defences);
});

// Get sent emails
router.get("/email/get", (req, res) => {
  res.send(req.session.sentEmails);
});

// clear emails
router.post("/email/clear", (req, res) => {
  req.session.sentEmails = [];
  res.send("Emails cleared");
});

// Chat to ChatGPT
router.post("/openai/chat", async (req, res) => {
  // set reply params
  const chatResponse: ChatHttpResponse = {
    reply: "",
    defenceInfo: {
      blockedReason: "",
      isBlocked: false,
      triggeredDefences: [],
    },
    numPhasesCompleted: req.session.numPhasesCompleted,
    transformedMessage: "",
    wonPhase: false,
  };

  // parse out the message
  const message: string = req.body?.message;
  const currentPhase: PHASE_NAMES = req.body?.currentPhase;
  let numPhasesCompleted = req.session.numPhasesCompleted;

  // if phase has changed, reinitialize the QA model with with new filepath
  if (prevPhase != currentPhase) {
    prevPhase = currentPhase;
    initQAModel(req.session.apiKey, retrievalQAPrePrompt, currentPhase);
  }

  if (message) {
    chatResponse.transformedMessage = message;
    // see if this message triggers any defences
    const useLlmEvaluation =
      currentPhase === PHASE_NAMES.PHASE_2 ||
      currentPhase === PHASE_NAMES.SANDBOX;
    chatResponse.defenceInfo = await detectTriggeredDefences(
      message,
      req.session.defences,
      useLlmEvaluation
    );
    // if blocked, send the response
    if (!chatResponse.defenceInfo.isBlocked) {
      // transform the message according to active defences
      chatResponse.transformedMessage = transformMessage(
        message,
        req.session.defences
      );

      // get the chatGPT reply
      try {
        const openAiReply = await chatGptSendMessage(
          req.session.chatHistory,
          req.session.defences,
          req.session.gptModel,
          chatResponse.transformedMessage,
          req.session.sentEmails,
          currentPhase
        );

        if (openAiReply) {
          chatResponse.wonPhase = openAiReply.wonPhase;
          chatResponse.reply = openAiReply.completion.content || "";
          // combine triggered defences
          chatResponse.defenceInfo.triggeredDefences = [
            ...chatResponse.defenceInfo.triggeredDefences,
            ...openAiReply.defenceInfo.triggeredDefences,
          ];
          // combine blocked
          chatResponse.defenceInfo.isBlocked =
            chatResponse.defenceInfo.isBlocked ||
            openAiReply.defenceInfo.isBlocked;
        }
      } catch (error: any) {
        console.log(error);
        if (error.response?.status == 401) {
          res.statusCode = 401;
          chatResponse.reply =
            "Please enter a valid OpenAI API key to chat to me!";
        } else {
          res.statusCode = 500;
          console.log(error);
          chatResponse.reply = "Failed to get chatGPT reply";
        }
      }
    }
  } else {
    res.statusCode = 400;
    chatResponse.reply = "Missing message";
    console.error(chatResponse.reply);
  }
  // enable next phase when user wins current phase
  if (chatResponse.wonPhase) {
    console.log("Win conditon met for phase: ", currentPhase);
    numPhasesCompleted = currentPhase + 1;
    req.session.numPhasesCompleted = numPhasesCompleted;
    chatResponse.numPhasesCompleted = numPhasesCompleted;
  }
  // log and send the reply with defence info
  console.log(chatResponse);
  res.send(chatResponse);
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req, res) => {
  req.session.chatHistory = [];
  res.send("ChatGPT messages cleared");
});

// Set API key
router.post("/openai/apiKey", async (req, res) => {
  const apiKey: string = req.body?.apiKey;
  if (!apiKey) {
    res.status(401).send("Invalid API key");
    return;
  }
  if (
    await setOpenAiApiKey(
      apiKey,
      req.session.gptModel,
      getQALLMprePrompt(req.session.defences)
    )
  ) {
    req.session.apiKey = apiKey;
    res.send("API key set");
  } else {
    res.status(401).send("Invalid API key");
  }
});

// Get API key
router.get("/openai/apiKey", (req, res) => {
  res.send(req.session.apiKey);
});

// Set the ChatGPT model
router.post("/openai/model", async (req, res) => {
  const model: CHAT_MODELS = req.body?.model;
  if (model) {
    if (await setGptModel(req.session, model)) {
      res.status(200).send("ChatGPT model set. ");
    } else {
      res.status(401).send("Could not set model");
    }
  }
});

router.get("/openai/model", (req, res) => {
  res.send(req.session.gptModel);
});

router.get("/phase/completed", (req, res) => {
  res.send(req.session.numPhasesCompleted.toString());
});

export { router };
