// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import { useEffect, useState } from "react";
import "./ModelSelection.css";
import { setGptModel, getGptModel } from "../../service/chatService";
import { CHAT_MODELS } from "../../models/chat";
import LoadingButton from "../ThemedButtons/LoadingButton";

// return a drop down menu with the models
function ModelSelection() {
  // model currently selected in the dropdown
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS.GPT_4);
  // model in use by the app
  const [modelInUse, setModelInUse] = useState(CHAT_MODELS.GPT_4);

  const [errorChangingModel, setErrorChangingModel] = useState(false);

  const [isSettingModel, setIsSettingModel] = useState(false);

  // handle button click to log the selected model
  async function submitSelectedModel() {
    console.log(`selected model: ${selectedModel}`);
    setIsSettingModel(true);
    const res = await setGptModel(selectedModel);
    setIsSettingModel(false);
    if (res) {
      setModelInUse(selectedModel);
      setErrorChangingModel(false);
    } else {
      setErrorChangingModel(true);
    }
  }

  // get the model
  useEffect(() => {
    getGptModel()
      .then((model) => {
        setModelInUse(model.id);
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
            onChange={(e) => {
              setSelectedModel(e.target.value as CHAT_MODELS);
            }}
          >
            {chatModelOptions.map((model) => (
              <option key={model} value={model} selected={model === modelInUse}>
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
