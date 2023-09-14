import { Slider } from "@mui/material";

import "./ModelTemperature.css";

function ModelTemperature() {
  return (
    <div id="model-temperature-row">
      <p>Model Temperature</p>
      <div className="temperature-slider">
        <Slider
          defaultValue={1}
          min={0}
          max={2}
          step={0.01}
          aria-label="Small"
          valueLabelDisplay="auto"
          sx={{
            color: "#1fd07b",
          }}
        />
      </div>
    </div>
  );
}

export default ModelTemperature;
