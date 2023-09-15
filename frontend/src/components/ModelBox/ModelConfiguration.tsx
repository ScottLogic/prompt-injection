import { useEffect, useState } from "react";
import "./ModelConfiguration.css";
import ModelConfigurationSlider from "./ModelConfigurationSlider";
import { CustomChatModelConfiguration } from "../../models/chat";
import { MODEL_CONFIG } from "../../models/chat";
import { getGptModel } from "../../service/chatService";

function ModelConfiguration() {
  const [customChatModelConfigs, setCustomChatModel] = useState<
    CustomChatModelConfiguration[]
  >([
    {
      id: MODEL_CONFIG.TEMPERATURE,
      value: 1,
      min: 0,
      max: 2,
    },
    {
      id: MODEL_CONFIG.TOP_P,
      value: 1,
      min: 0,
      max: 1,
    },
    {
      id: MODEL_CONFIG.PRESENCE_PENALTY,
      value: 0,
      min: 0,
      max: 2,
    },
    {
      id: MODEL_CONFIG.FREQUENCY_PENALTY,
      value: 0,
      min: 0,
      max: 2,
    },
  ]);

  // get model configs on mount
  useEffect(() => {
    getGptModel()
      .then((model) => {
        // apply the currently set values
        const newCustomChatModelConfigs = customChatModelConfigs.map(
          (config) => {
            const newConfig = { ...config };
            newConfig.value = model.configuration[config.id];
            return newConfig;
          }
        );
        console.log("newCustomChatModelConfigs = ", newCustomChatModelConfigs);
        setCustomChatModel(newCustomChatModelConfigs);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div id="model-config-box">
      <div className="model-config-row">
        <p>Model Temperature</p>
        <ModelConfigurationSlider config={customChatModelConfigs[0]} />
        <div className="model-config-row">
          <p>Top P</p>
          <ModelConfigurationSlider config={customChatModelConfigs[1]} />
        </div>
        <div className="model-config-row">
          <p>Presence Penalty</p>
          <ModelConfigurationSlider config={customChatModelConfigs[2]} />
        </div>
        <div className="model-config-row">
          <p>Frequency Penalty</p>
          <ModelConfigurationSlider config={customChatModelConfigs[3]} />
        </div>
      </div>
    </div>
  );
}

export default ModelConfiguration;
