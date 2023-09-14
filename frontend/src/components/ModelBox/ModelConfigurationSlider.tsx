import { Slider } from "@mui/material";
import { useState } from "react";

import "./ModelConfigurationSlider.css";
import { ChatModelConfiguration } from "../../models/chat";

function ModelConfigurationSlider({
  config,
}: {
  config: ChatModelConfiguration;
}) {
  const [value, setValue] = useState<number>(1);

  function handleValueChange(_: Event, value: number | number[]) {
    const val = Array.isArray(value) ? value[0] : value;
    setValue(val);
    console.log("config = ", config, "temp = ", val);
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
        onChange={handleValueChange}
        sx={{
          color: "#1fd07b",
        }}
      />
    </div>
  );
}

export default ModelConfigurationSlider;
