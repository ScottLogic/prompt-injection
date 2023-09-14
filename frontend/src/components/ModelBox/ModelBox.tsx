import ModelSelection from "./ModelSelection";
import "./ModelBox.css";
import ModelConfiguration from "./ModelConfiguration";

function ModelBox() {
  return (
    <div className="model-box">
      <div className="side-bar-header">Model</div>
      <ModelSelection />
      <ModelConfiguration />
    </div>
  );
}

export default ModelBox;
