import { useState } from "react";
import { DefenceConfig } from "../../models/defence";

import "./DefenceConfiguration.css";
import ThemedTextArea from "../ThemedUserInput/ThemedTextArea";

function DefenceConfiguration({
  config,
  isActive,
  setConfigurationValue,
}: {
  config: DefenceConfig;
  isActive: boolean;
  setConfigurationValue: (configId: string, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState<string>(config.value);

  // function focusLost(event: FocusEvent<HTMLDivElement>) {
  //   const value = event.target.innerText.trim();
  //   // asynchronously set the configuration value
  //   void setConfigurationValue(config.id, value);
  // }

  return (
    <div className="defence-configuration">
      <span>{config.name}: </span>
      <ThemedTextArea
        content={value}
        enterPressed={() => {
          void setConfigurationValue(config.id, value);
        }}
        setContent={setValue}
        disabled={!isActive}
      />
      {/* <ContentEditable
        className={configClass}
        onBlur={focusLost}
      /> */}
    </div>
  );
}

export default DefenceConfiguration;
