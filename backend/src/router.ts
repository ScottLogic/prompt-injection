import express from "express";

import { transformMessage, detectTriggeredDefences } from "./defence";
import {
  CHAT_MESSAGE_TYPE,
  ChatHistoryMessage,
  ChatHttpResponse,
  ChatModel,
  ChatModelConfiguration,
  MODEL_CONFIG,
  defaultChatModel,
} from "./models/chat";
import { Document } from "./models/document";
import { chatGptSendMessage, verifyKeySupportsModel } from "./openai";
import { LEVEL_NAMES } from "./models/level";
import * as fs from "fs";
import { EmailClearRequest } from "./models/api/EmailClearRequest";
import { OpenAiChatRequest } from "./models/api/OpenAiChatRequest";
import { OpenAiAddHistoryRequest } from "./models/api/OpenAiAddHistoryRequest";
import { OpenAiClearRequest } from "./models/api/OpenAiClearRequest";
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
router.get("/email/get", (req, res) => {
  const { query } = req;
  const level: number | undefined = query.level as number | undefined;
  if (level !== undefined) {
    res.send(req.session.levelState[level].sentEmails);
  } else {
    res.statusCode = 400;
    res.send("Missing level");
  }
});

// clear emails
router.post("/email/clear", (req: EmailClearRequest, res) => {
  const level = req.body.level;
  if (level !== undefined && level >= LEVEL_NAMES.LEVEL_1) {
    req.session.levelState[level].sentEmails = [];
    console.debug("Emails cleared");
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

function handleChatError(
  res: express.Response,
  chatResponse: ChatHttpResponse,
  blocked: boolean,
  errorMsg: string,
  statusCode = 500
) {
  console.error(errorMsg);
  chatResponse.reply = errorMsg;
  chatResponse.defenceInfo.isBlocked = blocked;
  chatResponse.isError = true;
  if (blocked) {
    chatResponse.defenceInfo.blockedReason = errorMsg;
  }
  res.status(statusCode).send(chatResponse);
}
// Chat to ChatGPT
router.post(
  "/openai/chat",
  async (req: OpenAiChatRequest, res: express.Response) => {
    // set reply params
    const chatResponse: ChatHttpResponse = {
      reply: "",
      defenceInfo: {
        blockedReason: "",
        isBlocked: false,
        alertedDefences: [],
        triggeredDefences: [],
      },
      transformedMessage: "",
      wonLevel: false,
      isError: false,
    };
    const message = req.body.message;
    const currentLevel = req.body.currentLevel;

    // must have initialised openai
    if (message === undefined || currentLevel === undefined) {
      handleChatError(
        res,
        chatResponse,
        true,
        "Please send a message and current level to chat to me!",
        400
      );
      return;
    }

    const MESSAGE_CHARACTER_LIMIT = 16384;
    if (message.length > MESSAGE_CHARACTER_LIMIT) {
      handleChatError(
        res,
        chatResponse,
        true,
        "Message exceeds character limit",
        400
      );
      return;
    }

    // set the transformed message to begin with
    chatResponse.transformedMessage = message;

    // use default model for levels, allow user to select in sandbox
    const chatModel =
      currentLevel === LEVEL_NAMES.SANDBOX
        ? req.session.chatModel
        : defaultChatModel;

    // record the history before chat completion called
    const chatHistoryBefore = [
      ...req.session.levelState[currentLevel].chatHistory,
    ];
    try {
      if (message) {
        // skip defence detection / blocking for levels 1 and 2- sets chatResponse obj
        if (currentLevel < LEVEL_NAMES.LEVEL_3) {
          await handleLowLevelChat(req, chatResponse, currentLevel, chatModel);
        } else {
          // apply the defence detection for level 3 and sandbox - sets chatResponse obj
          await handleHigherLevelChat(
            req,
            message,
            chatHistoryBefore,
            chatResponse,
            currentLevel,
            chatModel
          );
        }
        // if the reply was blocked then add it to the chat history
        if (chatResponse.defenceInfo.isBlocked) {
          req.session.levelState[currentLevel].chatHistory.push({
            completion: null,
            chatMessageType: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
            infoMessage: chatResponse.defenceInfo.blockedReason,
          });
        } else if (!chatResponse.reply || chatResponse.reply === "") {
          // add error message to chat history
          req.session.levelState[currentLevel].chatHistory.push({
            completion: null,
            chatMessageType: CHAT_MESSAGE_TYPE.ERROR_MSG,
            infoMessage: "Failed to get chatGPT reply",
          });
          // throw so handle error called
          throw new Error("Failed to get chatGPT reply");
        }
      } else {
        handleChatError(res, chatResponse, true, "Missing message");
        return;
      }
    } catch (error) {
      handleChatError(res, chatResponse, false, "Failed to get chatGPT reply");
      return;
    }

    // log and send the reply with defence info
    console.log(chatResponse);
    res.send(chatResponse);
  }
);

// handle the chat logic for level 1 and 2 with no defences applied
async function handleLowLevelChat(
  req: OpenAiChatRequest,
  chatResponse: ChatHttpResponse,
  currentLevel: LEVEL_NAMES,
  chatModel: ChatModel
) {
  // get the chatGPT reply
  const openAiReply = await chatGptSendMessage(
    req.session.levelState[currentLevel].chatHistory,
    req.session.levelState[currentLevel].defences,
    chatModel,
    chatResponse.transformedMessage,
    false,
    req.session.levelState[currentLevel].sentEmails,
    currentLevel
  );
  chatResponse.reply = openAiReply.completion?.content ?? "";
  chatResponse.wonLevel = openAiReply.wonLevel;
}

// handle the chat logic for high levels (with defence detection)
async function handleHigherLevelChat(
  req: OpenAiChatRequest,
  message: string,
  chatHistoryBefore: ChatHistoryMessage[],
  chatResponse: ChatHttpResponse,
  currentLevel: LEVEL_NAMES,
  chatModel: ChatModel
) {
  let openAiReply = null;

  // transform the message according to active defences
  chatResponse.transformedMessage = transformMessage(
    message,
    req.session.levelState[currentLevel].defences
  );
  // if message has been transformed then add the original to chat history and send transformed to chatGPT
  const messageIsTransformed = chatResponse.transformedMessage !== message;
  if (messageIsTransformed) {
    req.session.levelState[currentLevel].chatHistory.push({
      completion: null,
      chatMessageType: CHAT_MESSAGE_TYPE.USER,
      infoMessage: message,
    });
  }
  // detect defences on input message
  const triggeredDefencesPromise = detectTriggeredDefences(
    message,
    req.session.levelState[currentLevel].defences
  ).then((defenceInfo) => {
    chatResponse.defenceInfo = defenceInfo;
  });

  // get the chatGPT reply
  try {
    const openAiReplyPromise = chatGptSendMessage(
      req.session.levelState[currentLevel].chatHistory,
      req.session.levelState[currentLevel].defences,
      chatModel,
      chatResponse.transformedMessage,
      messageIsTransformed,
      req.session.levelState[currentLevel].sentEmails,
      currentLevel
    );

    // run defence detection and chatGPT concurrently
    const [, openAiReplyResolved] = await Promise.all([
      triggeredDefencesPromise,
      openAiReplyPromise,
    ]);
    openAiReply = openAiReplyResolved;

    // if input message is blocked, restore the original chat history and add user message (not as completion)
    if (chatResponse.defenceInfo.isBlocked) {
      // set to null to stop message being returned to user
      openAiReply = null;

      // restore the original chat history
      req.session.levelState[currentLevel].chatHistory = chatHistoryBefore;

      req.session.levelState[currentLevel].chatHistory.push({
        completion: null,
        chatMessageType: CHAT_MESSAGE_TYPE.USER,
        infoMessage: message,
      });
    }

    if (openAiReply) {
      chatResponse.wonLevel = openAiReply.wonLevel;
      chatResponse.reply = openAiReply.completion?.content ?? "";

      // combine triggered defences
      chatResponse.defenceInfo.triggeredDefences = [
        ...chatResponse.defenceInfo.triggeredDefences,
        ...openAiReply.defenceInfo.triggeredDefences,
      ];
      // combine blocked
      chatResponse.defenceInfo.isBlocked = openAiReply.defenceInfo.isBlocked;

      // combine blocked reason
      chatResponse.defenceInfo.blockedReason =
        openAiReply.defenceInfo.blockedReason;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}

// get the chat history
router.get("/openai/history", (req, res) => {
  const level: number | undefined = req.query.level as number | undefined;
  if (level !== undefined) {
    res.send(req.session.levelState[level].chatHistory);
  } else {
    res.statusCode = 400;
    res.send("Missing level");
  }
});

// add an info message to chat history
router.post("/openai/addHistory", (req: OpenAiAddHistoryRequest, res) => {
  const infoMessage = req.body.message;
  const chatMessageType = req.body.chatMessageType;
  const level = req.body.level;
  if (
    infoMessage &&
    chatMessageType &&
    level !== undefined &&
    level >= LEVEL_NAMES.LEVEL_1
  ) {
    req.session.levelState[level].chatHistory.push({
      completion: null,
      chatMessageType,
      infoMessage,
    });
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

// Clear the ChatGPT messages
router.post("/openai/clear", (req: OpenAiClearRequest, res) => {
  const level = req.body.level;
  if (level !== undefined && level >= LEVEL_NAMES.LEVEL_1) {
    req.session.levelState[level].chatHistory = [];
    console.debug("ChatGPT messages cleared");
    res.send();
  } else {
    res.statusCode = 400;
    res.send();
  }
});

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
