import { DefenceConfig } from "../../models/defence";

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
      <span className="defence-config-name">{config.name} </span>
      <input
        className="defence-config-value"
        type="text"
        title="Press enter to save"
        defaultValue={config.value}
        onKeyUp={setConfiguration.bind(this)}
        onClick={(event) => event.stopPropagation()}
      ></input>
    </div>
  );
}

export default DefenceConfiguration;
