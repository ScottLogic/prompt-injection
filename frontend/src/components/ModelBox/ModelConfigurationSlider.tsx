import { Slider } from "@mui/material";
import { useState } from "react";

import "./ModelConfigurationSlider.css";
import { ChatModelConfiguration } from "../../models/chat";
import { configureGptModel } from "../../service/chatService";

function ModelConfigurationSlider({
  config,
}: {
  config: ChatModelConfiguration;
}) {
  const [value, setValue] = useState<number>(1);

  async function handleValueChange(_: Event, value: number | number[]) {
    const val = Array.isArray(value) ? value[0] : value;
    setValue(val);
    await configureGptModel(config.id, val);
  }

  return (
    <div className="model-config-slider">
      <Slider
        aria-label={config.id}
        getAriaValueText={(value) => `${value}`}
        min={config.min}
        max={config.max}
        defaultValue={config.default}
        step={config.step}
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
