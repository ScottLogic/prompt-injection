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
  const setConfiguration = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setConfigurationValue(config.id, event.currentTarget.value);
    }
  };

  return (
    <div>
      <span className="defence-config-name">{config.name}: </span>
      <ContentEditable
        className="defence-config-value"
        html={config.value}
        onKeyUp={setConfiguration.bind(this)}
        onClick={(event) => event.stopPropagation()}
        onChange={() => {}}
      />
    </div>
  );
}

export default DefenceConfiguration;
