import ModelSelection from "./ModelSelection";
import "./ModelBox.css";
import ModelTemperature from "./ModelTemperature";

function ModelBox() {
  return (
    <div className="model-box">
      <div className="side-bar-header">Model</div>
      <ModelSelection />
      <ModelTemperature />
    </div>
  );
}

export default ModelBox;
