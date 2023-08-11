// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import React, { useEffect, useState } from "react";
import "./ModelSelectionBox.css";
import { setGptModel, getGptModel } from "../../service/chatService";
import { CHAT_MODELS } from "../../models/chat";

// return a drop down menu with the models
function ModelSelectionBox() {
  // model currently selected in the dropdown
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  // model in use by the app
  const [modelInUse, setModelInUse] = useState("gpt-4");

  const [errorChangingModel, setErrorChangingModel] = useState(false);

  // handle button click to log the selected model
  const submitSelectedModel = async () => {
    console.log("selected model: " + selectedModel);
    if (await setGptModel(selectedModel)) {
      setModelInUse(selectedModel);
      setErrorChangingModel(false);
    } else {
      setErrorChangingModel(true);
    }
  };

  // get the model
  useEffect(() => {
    const getModel = async () => {
      const model = await getGptModel();
      if (model) {
        setModelInUse(model);
      }
    };
    getModel();
  }, []);

  const chatModelOptions = Object.values(CHAT_MODELS);

  // return a drop down menu with the models
  return (
    <div id="model-selection-box">
      <div id="model-selection-row">
        <p>Select a model: </p>
        <select
          id="model-selection-menu"
          aria-label="model-select"
          onChange={(e) => setSelectedModel(e.target.value)}
          placeholder={modelInUse}
        >
          {chatModelOptions.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
          ;
        </select>
        <button
          id="model-selection-button"
          onClick={async () => submitSelectedModel()}
        >
          Choose
        </button>
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
