// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import React, { useEffect, useState } from "react";
import "./ModelSelectionBox.css";
import { setGptModel, getGptModel } from "../../service/openaiService";

// return a drop down menu with the models
function ModelSelectionBox() {
  const modelList = [
    "gpt-4",
    "gpt-4-0613",
    "gpt-4-32k",
    "gpt-4-32k-0613",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0613",
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo-16k-0613",
  ];

  const [selectedModel, setSelectedModel] = useState("gpt-4");

  // handle button click to log the selected model
  const submitSelectedModel = async () => {
    console.log("selected model: " + selectedModel);
    await setGptModel(selectedModel);
  };

  // get the model
  useEffect(() => {
    const getModel = async () => {
      const model = await getGptModel();
      if (model) {
        console.log("Previous set model: " + model);
        setSelectedModel(model);
      }
    };
    getModel();
  }, []);

  // return a drop down menu with the models
  return (
    <div id="model-selection-box">
      <div id="model-selection-row">
        <p>Select a model: {selectedModel} </p>
        <select
          id="model-selection-menu"
          aria-label="model-select"
          onChange={(e) => setSelectedModel(e.target.value)}
          placeholder={selectedModel}
        >
          {modelList.map((model) => (
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
    </div>
  );
}

export default ModelSelectionBox;
