import "./DefenceConfiguration.css";
import { DefenceConfig } from "../../models/defence";
import ContentEditable from "react-contenteditable";

function DefenceConfiguration({
  config,
  isActive,
  setConfigurationValue,
}: {
  config: DefenceConfig;
  isActive: boolean;
  setConfigurationValue: (configId: string, value: string) => Promise<void>;
}) {
  function inputKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      // stop new line from being input
      event.preventDefault();
    }
  }

  function inputKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      const value = event.currentTarget.innerText.trim();
      // asynchronously set the configuration value
      void setConfigurationValue(config.id, value);
    }
  }

  function getClassName() {
    if (isActive) {
      return "defence-config-value prompt-injection-input";
    } else {
      return "defence-config-value prompt-injection-input inactive";
    }
  }

  return (
    <div>
      <span className="defence-config-name">{config.name}: </span>
      <ContentEditable
        className={getClassName()}
        html={config.value.toString()}
        onKeyDown={inputKeyDown}
        onKeyUp={inputKeyUp}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={() => {
          return;
        }}
        disabled={!isActive}
      />
    </div>
  );
}

export default DefenceConfiguration;
