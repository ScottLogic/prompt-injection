// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import { useEffect, useState } from "react";
import "./ModelSelectionBox.css";
import { setGptModel, getGptModel } from "../../service/chatService";
import { CHAT_MODELS } from "../../models/chat";

// return a drop down menu with the models
function ModelSelectionBox() {
  // model currently selected in the dropdown
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS.GPT_4);
  // model in use by the app
  const [modelInUse, setModelInUse] = useState(CHAT_MODELS.GPT_4);

  const [errorChangingModel, setErrorChangingModel] = useState(false);

  // handle button click to log the selected model
  async function submitSelectedModel() {
    console.log(`selected model: ${  selectedModel}`);
    if (await setGptModel(selectedModel)) {
      setModelInUse(selectedModel);
      setErrorChangingModel(false);
    } else {
      setErrorChangingModel(true);
    }
  }

  // get the model
  useEffect(() => {
    getGptModel().then((model) => {
      setModelInUse(model);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  const chatModelOptions = Object.values(CHAT_MODELS);

  // return a drop down menu with the models
  return (
    <div id="model-selection-box">
      <div className="side-bar-header">Model</div>
      <div id="model-selection-row">
        <div id="text-area">
          <p>Select a model: </p>
        </div>
        <div id="menu-area">
          <select
            id="model-selection-menu"
            aria-label="model-select"
            onChange={(e) => { setSelectedModel(e.target.value as CHAT_MODELS); }}
            placeholder={modelInUse}
          >
            {chatModelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            ;
          </select>
        </div>
        <div id="button-area">
          <button
            id="model-selection-button"
            className="prompt-injection-button"
            onClick={void submitSelectedModel}
          >
            Choose
          </button>
        </div>
      </div>

      <div id="model-selection-info">
        {errorChangingModel ? (
          <p id="error">
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

export default ModelSelectionBox;
