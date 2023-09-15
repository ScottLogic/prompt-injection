import { Slider } from "@mui/material";
import { useEffect, useState } from "react";

import "./ModelConfigurationSlider.css";
import { CustomChatModelConfiguration } from "../../models/chat";
import { configureGptModel } from "../../service/chatService";

function ModelConfigurationSlider({
  config,
}: {
  config: CustomChatModelConfiguration;
}) {
  const [value, setValue] = useState<number>(config.value);

  async function handleValueChange(_: Event, value: number | number[]) {
    const val = Array.isArray(value) ? value[0] : value;
    setValue(val);
    await configureGptModel(config.id, val);
  }

  useEffect(() => {
    setValue(config.value);
  }, [config]);

  return (
    <div className="model-config-slider">
      <Slider
        aria-label={config.id}
        getAriaValueText={(value) => `${value}`}
        min={config.min}
        max={config.max}
        step={0.1}
        valueLabelDisplay="auto"
        value={value}
        onChange={(event, value) => void handleValueChange(event, value)}
        sx={{
          color: "#1fd07b",
        }}
      />
    </div>
  );
}

export default ModelConfigurationSlider;
