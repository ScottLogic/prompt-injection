import { OpenAiSetModelRequest } from "../models/api/OpenAiSetModelRequest";
import { Response } from "express";
import { verifyKeySupportsModel } from "../openai";
import { ChatModelConfiguration, MODEL_CONFIG } from "../models/chat";
import { OpenAiConfigureModelRequest } from "../models/api/OpenAiConfigureModelRequest";
import { GetRequestQueryLevel } from "../models/api/GetRequestQueryLevel";
<<<<<<< HEAD
=======
import { stringify } from "querystring";
>>>>>>> dev

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

async function handleSetModel(req: OpenAiSetModelRequest, res: Response) {
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
}

function handleConfigureModel(req: OpenAiConfigureModelRequest, res: Response) {
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

function handleGetModel(req: GetRequestQueryLevel, res: Response) {
  res.send(req.session.chatModel);
}

export { handleSetModel, handleConfigureModel, handleGetModel };
