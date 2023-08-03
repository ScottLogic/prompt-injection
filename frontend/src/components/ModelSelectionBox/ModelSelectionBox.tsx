// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import React, { useEffect, useState } from "react";
import "./ModelSelectionBox.css";

// return a drop down menu with the models
function ModelSelectionBox() {
  const modelList = ["gpt-4", "gpt-3.5-turbo", "gpt-3"];

  const [selectedModel, setSelectedModel] = useState("");

  // handle button click to log the selected model
  const submitSelectedModel = () => {
    console.log(selectedModel);
  };

  // return a drop down menu with the models
  return (
    <div id="model-selection-box">
      <p>Select a model: </p>
      <select
        id="model-selection-menu"
        aria-label="model-select"
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {modelList.map((model) => (
          <option value={model}>{model}</option>
        ))}
        ;
      </select>
      <button
        id="model-selection-button"
        onClick={() => console.log(selectedModel)}
      >
        Choose
      </button>
    </div>
  );
}

export default ModelSelectionBox;
