// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import React, { useEffect, useState } from "react";
import "./ModelSelectionBox.css";
import { setGptModel, getGptModel } from "../../service/openaiService";
import { CHAT_MODELS } from "../../models/chat";

// return a drop down menu with the models
function ModelSelectionBox() {
  // model currently selected in the dropdown
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  // model in use by the app
  const [modelInUse, setModelInUse] = useState("gpt-4");

  // handle button click to log the selected model
  const submitSelectedModel = async () => {
    console.log("selected model: " + selectedModel);
    if (await setGptModel(selectedModel)) {
      setModelInUse(selectedModel);
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
            <option value={model}>{model}</option>
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
        <p>
          You are chatting to model: <b> {modelInUse}</b>
        </p>
      </div>
    </div>
  );
}

export default ModelSelectionBox;
