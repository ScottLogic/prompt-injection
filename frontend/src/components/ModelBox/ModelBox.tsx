import ModelSelection from "./ModelSelection";
import "./ModelBox.css";
import ModelConfiguration from "./ModelConfiguration";

function ModelBox() {
  return (
    <div className="model-box">
      <ModelSelection />
      <ModelConfiguration />
    </div>
  );
}

export default ModelBox;
