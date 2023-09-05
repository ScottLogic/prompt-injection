import "./DefenceConfiguration.css";
import { DefenceConfig } from "../../models/defence";
import ContentEditable from "react-contenteditable";

function DefenceConfiguration(
  {
    config,
    setConfigurationValue,
  }: {
    config: DefenceConfig;
    setConfigurationValue: (configId: string, value: string) => Promise<void>;
  }
) {
  function setConfiguration(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      const value = event.currentTarget.innerText.trim();
      // asynchronously set the configuration value
      void setConfigurationValue(config.id, value);
    }
  }

  return (
    <div>
      <span className="defence-config-name">{config.name}: </span>
      <ContentEditable
        className="defence-config-value prompt-injection-input"
        html={config.value.toString()}
        onKeyUp={setConfiguration}
        onClick={(event) => { event.stopPropagation(); }}
        onChange={() => {return;}}
      />
    </div>
  );
}

export default DefenceConfiguration;
