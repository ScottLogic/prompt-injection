import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";

function DefenceBox() {
  const defences = [
    {
      name: "character limit",
      info: "limit the number of characters in the user input. this is a form of prompt validation.",
    },
  ];

  return (
    <div id="defence-box">
      {defences.map((defence, index) => {
        return (
          <DefenceMechanism
            name={defence.name}
            info={defence.info}
            key={index}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
