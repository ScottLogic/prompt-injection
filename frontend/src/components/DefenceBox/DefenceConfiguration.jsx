function DefenceConfiguration(props) {
  const setConfiguration = (event) => {
    if (event.key === "Enter") {
      props.setConfigurationValue(props.config.id, event.target.value);
    }
  };

  return (
    <div>
      <span className="defence-configuration-name">{props.config.name} </span>
      <input
        className="defence-configuration-value"
        placeholder={props.config.value}
        onKeyUp={setConfiguration.bind(this)}
        onClick={(event) => event.stopPropagation()}
      ></input>
    </div>
  );
}

export default DefenceConfiguration;
