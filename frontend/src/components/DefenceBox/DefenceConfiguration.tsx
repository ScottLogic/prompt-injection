import "./DefenceConfiguration.css";
import { DefenceConfig } from "../../models/defence";
import ContentEditable from "react-contenteditable";

function DefenceConfiguration(
  this: any,
  {
    config,
    setConfigurationValue,
  }: {
    config: DefenceConfig;
    setConfigurationValue: (configId: string, value: string) => void;
  }
) {
  const setConfiguration = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      const value = event.currentTarget.innerText.trim();
      setConfigurationValue(config.id, value);
    }
  };

  return (
    <div>
      <span className="defence-config-name">{config.name}: </span>
      <ContentEditable
        className="defence-config-value prompt-injection-input"
        html={config.value.toString()}
        onKeyUp={setConfiguration.bind(this)}
        onClick={(event) => event.stopPropagation()}
        onChange={() => {}}
      />
    </div>
  );
}

export default DefenceConfiguration;
