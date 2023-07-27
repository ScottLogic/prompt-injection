function DefenceConfiguration(props) {
  return (
    <div>
      <span className="defence-configuration-name">{props.config.name} </span>
      <input
        className="defence-configuration-value"
        value={props.config.value}
      ></input>
    </div>
  );
}

export default DefenceConfiguration;
