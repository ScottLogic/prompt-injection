import "./ModelBox.css";
import ModelConfiguration from "./ModelConfiguration";
import ModelSelection from "./ModelSelection";

function ModelBox() {
  return (
    <div className="model-box">
      <ModelSelection />
      <ModelConfiguration />
    </div>
  );
}

export default ModelBox;
