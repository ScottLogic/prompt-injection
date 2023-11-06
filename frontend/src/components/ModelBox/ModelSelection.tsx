// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import { useEffect, useState } from "react";
import "./ModelSelection.css";
import { setGptModel, getGptModel } from "../../service/chatService";
import { CHAT_MODELS } from "../../models/chat";
import LoadingButton from "../ThemedButtons/LoadingButton";

// return a drop down menu with the models
function ModelSelection() {
  // model currently selected in the dropdown
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS.GPT_3_5_TURBO);
  // model in use by the app
  const [modelInUse, setModelInUse] = useState(CHAT_MODELS.GPT_3_5_TURBO);

  const [errorChangingModel, setErrorChangingModel] = useState(false);

  const [isSettingModel, setIsSettingModel] = useState(false);

  // handle button click to log the selected model
  async function submitSelectedModel() {
    if (!isSettingModel) {
      const currentSelectedModel = selectedModel;
      console.log(`selected model: ${currentSelectedModel}`);
      setIsSettingModel(true);
      const modelUpdated = await setGptModel(currentSelectedModel);
      setIsSettingModel(false);
      if (modelUpdated) {
        setModelInUse(currentSelectedModel);
        setErrorChangingModel(false);
      } else {
        setErrorChangingModel(true);
      }
    }
  }

  // get the model
  useEffect(() => {
    getGptModel()
      .then((model) => {
        setModelInUse(model.id);
        // default the dropdown selection to the model in use
        setSelectedModel(model.id);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const chatModelOptions = Object.values(CHAT_MODELS);

  // return a drop down menu with the models
  return (
    <div className="model-selection-box">
      <div className="model-selection-row">
        <p>Select model: </p>
        <div className="select-wrapper">
          <select
            aria-label="model-select"
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value as CHAT_MODELS);
            }}
          >
            {chatModelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            ;
          </select>
          <LoadingButton
            onClick={() => void submitSelectedModel()}
            isLoading={isSettingModel}
          >
            Choose
          </LoadingButton>
        </div>
      </div>

      <div className="model-selection-info">
        {errorChangingModel ? (
          <p className="error">
            Could not change model. You are still chatting to:
            <b> {modelInUse} </b>
          </p>
        ) : (
          <p>
            You are chatting to model: <b> {modelInUse}</b>
          </p>
        )}
      </div>
    </div>
  );
}

export default ModelSelection;
