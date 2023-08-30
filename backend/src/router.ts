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
import {
  CHAT_MESSAGE_TYPE,
  CHAT_MODELS,
  ChatHttpResponse,
} from "./models/chat";
import { DEFENCE_TYPES, DefenceConfig } from "./models/defence";
import { chatGptSendMessage, setOpenAiApiKey, setGptModel } from "./openai";
import { retrievalQAPrePrompt } from "./promptTemplates";
import { PHASE_NAMES } from "./models/phase";

const router = express.Router();

// keep track of phase change to reinitialize models
let prevPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX;

// Activate a defence
router.post("/defence/activate", (req, res) => {
  // id of the defence
  const defenceId: DEFENCE_TYPES = req.body?.defenceId;
  const phase: PHASE_NAMES = req.body?.phase;
  if (defenceId && phase) {
    // activate the defence
    req.session.phaseState[phase].defences = activateDefence(
      defenceId,
      req.session.phaseState[phase].defences
    );
    // need to re-initialize QA model when turned on
    if (
      defenceId === DEFENCE_TYPES.QA_LLM_INSTRUCTIONS &&
      req.session.openAiApiKey
    ) {
      console.debug(
        "Activating qa llm instruction defence - reinitializing qa model"
      );
      initQAModel(
        req.session.openAiApiKey,
        getQALLMprePrompt(req.session.phaseState[phase].defences)
      );
    }

    res.send("Defence activated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId or phase");
  }
});

// Deactivate a defence
router.post("/defence/deactivate", (req, res) => {
  // id of the defence
  const defenceId: DEFENCE_TYPES = req.body?.defenceId;
  const phase: PHASE_NAMES = req.body?.phase;
  if (defenceId && phase) {
    // deactivate the defence
    req.session.phaseState[phase].defences = deactivateDefence(
      defenceId,
      req.session.phaseState[phase].defences
    );

    if (
      defenceId === DEFENCE_TYPES.QA_LLM_INSTRUCTIONS &&
      req.session.openAiApiKey
    ) {
      console.debug("Resetting QA model with default prompt");
      initQAModel(
        req.session.openAiApiKey,
        getQALLMprePrompt(req.session.phaseState[phase].defences)
      );
    }
    res.send("Defence deactivated");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId or phase");
  }
});

// Configure a defence
router.post("/defence/configure", (req, res) => {
  // id of the defence
  const defenceId: DEFENCE_TYPES = req.body?.defenceId;
  const config: DefenceConfig[] = req.body?.config;
  const phase: PHASE_NAMES = req.body?.phase;
  if (defenceId && config && phase >= 0) {
    // configure the defence
    req.session.phaseState[phase].defences = configureDefence(
      defenceId,
      req.session.phaseState[phase].defences,
      config
    );
    res.send("Defence configured");
  } else {
    res.statusCode = 400;
    res.send("Missing defenceId or config or phase");
  }
});

// reset the active defences
router.post("/defence/reset", (req, res) => {
  const phase: PHASE_NAMES = req.body?.phase;
  if (phase >= 0) {
    req.session.phaseState[phase].defences = getInitialDefences();
    console.debug("Defences reset");
    res.send("Defences reset");
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// Get the status of all defences /defence/status?phase=1
router.get("/defence/status", (req, res) => {
  const phase: number | undefined = req.query?.phase as number | undefined;
  if (phase) {
    res.send(req.session.phaseState[phase].defences);
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// Get sent emails // /email/get?phase=1
router.get("/email/get", (req, res) => {
  const phase: number | undefined = req.query?.phase as number | undefined;
  if (phase) {
    res.send(req.session.phaseState[phase].sentEmails);
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// clear emails
router.post("/email/clear", (req, res) => {
  const phase: PHASE_NAMES = req.body?.phase;
  if (phase >= 0) {
    req.session.phaseState[phase].sentEmails = [];
    console.debug("Emails cleared");
    res.send("Emails cleared");
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// Chat to ChatGPT
router.post("/openai/chat", async (req, res) => {
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

  // must have initialised openai
  if (!req.session.openAiApiKey) {
    res.statusCode = 401;
    chatResponse.defenceInfo.isBlocked = true;
    chatResponse.defenceInfo.blockedReason =
      "Please enter a valid OpenAI API key to chat to me!";
    console.error(chatResponse.reply);
  } else {
    // parse out the message
    const message: string = req.body?.message;
    const currentPhase: PHASE_NAMES = req.body?.currentPhase;
    let numPhasesCompleted = req.session.numPhasesCompleted;

    // if phase has changed, reinitialize the QA model with with new filepath
    if (prevPhase != currentPhase) {
      prevPhase = currentPhase;
      initQAModel(req.session.openAiApiKey, retrievalQAPrePrompt, currentPhase);
    }
    if (message) {
      chatResponse.transformedMessage = message;
      // see if this message triggers any defences (only for phase 2 and sandbox)
      if (
        currentPhase === PHASE_NAMES.PHASE_2 ||
        currentPhase === PHASE_NAMES.SANDBOX
      ) {
        chatResponse.defenceInfo = await detectTriggeredDefences(
          message,
          req.session.phaseState[currentPhase].defences
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
            req.session.gptModel,
            chatResponse.transformedMessage,
            messageIsTransformed,
            req.session.openAiApiKey,
            req.session.phaseState[currentPhase].sentEmails,
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

            // combine blocked reason
            chatResponse.defenceInfo.blockedReason =
              chatResponse.defenceInfo.blockedReason ||
              openAiReply.defenceInfo.blockedReason;
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
  const phase: number | undefined = req.query?.phase as number | undefined;
  if (phase) {
    res.send(req.session.phaseState[phase].chatHistory);
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// add an info message to chat history
router.post("/openai/addHistory", (req, res) => {
  const message: string = req.body?.message;
  const chatMessageType: CHAT_MESSAGE_TYPE = req.body?.chatMessageType;
  const phase: PHASE_NAMES = req.body?.phase;
  if (message && chatMessageType && phase >= 0) {
    req.session.phaseState[phase].chatHistory.push({
      completion: null,
      chatMessageType: chatMessageType,
      infoMessage: message,
    });
    res.send("Message added to chat history");
  } else {
    res.statusCode = 400;
    res.send("Missing message or message type or phase");
  }
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req, res) => {
  const phase: PHASE_NAMES = req.body?.phase;
  if (phase >= 0) {
    req.session.phaseState[phase].chatHistory = [];
    console.debug("ChatGPT messages cleared");
    res.send("ChatGPT messages cleared");
  } else {
    res.statusCode = 400;
    res.send("Missing phase");
  }
});

// Set API key
router.post("/openai/apiKey", async (req, res) => {
  const openAiApiKey: string = req.body?.openAiApiKey;
  if (!openAiApiKey) {
    res.status(401).send("Invalid API key");
    return;
  }
  if (
    await setOpenAiApiKey(
      openAiApiKey,
      req.session.gptModel,
      getQALLMprePrompt(req.session.phaseState[3].defences) // use phase 2 as only phase with QA LLM defence
    )
  ) {
    req.session.openAiApiKey = openAiApiKey;
    res.send("API key set");
  } else {
    res.status(401).send("Invalid API key");
  }
});

// Get API key
router.get("/openai/apiKey", (req, res) => {
  res.send(req.session.openAiApiKey);
});

// Set the ChatGPT model
router.post("/openai/model", async (req, res) => {
  const model: CHAT_MODELS = req.body?.model;
  if (!model) {
    res.status(400).send("Missing model");
  } else if (!req.session.openAiApiKey) {
    res
      .status(401)
      .send("Please enter a valid OpenAI API key to set the model!");
  } else if (model === req.session.gptModel) {
    res.status(200).send("ChatGPT model already set. ");
  } else if (await setGptModel(req.session.openAiApiKey, model)) {
    res.status(200).send("ChatGPT model set. ");
  } else {
    res.status(401).send("Could not set model");
  }
});

router.get("/openai/model", (req, res) => {
  res.send(req.session.gptModel);
});

router.get("/phase/completed", (req, res) => {
  res.send(req.session.numPhasesCompleted.toString());
});

export { router };
