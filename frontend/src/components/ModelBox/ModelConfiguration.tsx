import { useState } from "react";
import "./ModelConfiguration.css";
import ModelConfigurationSlider from "./ModelConfigurationSlider";
import { ChatModelConfiguration } from "../../models/chat";
import { MODEL_CONFIG } from "../../models/chat";

function ModelConfiguration() {
  const [modelConfigurations, setModelConfigurations] = useState<
    ChatModelConfiguration[]
  >([
    {
      id: MODEL_CONFIG.TEMPERATURE,
      value: 1,
      default: 1,
      min: 0,
      max: 2,
      step: 0.1,
    },
    {
      id: MODEL_CONFIG.TOP_P,
      value: 1,
      default: 1,
      min: 0,
      max: 1,
      step: 0.1,
    },
    {
      id: MODEL_CONFIG.PRESENCE_PENALTY,
      value: 0,
      default: 0,
      min: 0,
      max: 2,
      step: 0.1,
    },
    {
      id: MODEL_CONFIG.FREQUENCY_PENALTY,
      value: 0,
      default: 0,
      min: 0,
      max: 2,
      step: 0.1,
    },
  ]);

  return (
    <div className="model-config-row">
      <p>Model Temperature</p>
      <ModelConfigurationSlider config={modelConfigurations[0]} />
      <div className="model-config-row">
        <p>Top P</p>
        <ModelConfigurationSlider config={modelConfigurations[1]} />
      </div>
      <div className="model-config-row">
        <p>Presence Penalty</p>
        <ModelConfigurationSlider config={modelConfigurations[2]} />
      </div>
      <div className="model-config-row">
        <p>Frequency Penalty</p>
        <ModelConfigurationSlider config={modelConfigurations[3]} />
      </div>
    </div>
  );
}

export default ModelConfiguration;
