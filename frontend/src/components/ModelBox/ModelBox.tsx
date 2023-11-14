import ModelConfiguration from "./ModelConfiguration";
import ModelSelection from "./ModelSelection";
import "./ModelBox.css";

function ModelBox() {
  return (
    <div className="model-box">
      <ModelSelection />
      <ModelConfiguration />
    </div>
  );
}

export default ModelBox;
