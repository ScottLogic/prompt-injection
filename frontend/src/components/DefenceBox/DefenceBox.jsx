import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";

function DefenceBox() {
  const defences = [
    {
      name: "character limit",
      id: "CHARACTER_LIMIT",
      info: "limit the number of characters in the user input. this is a form of prompt validation.",
    },
  ];

  return (
    <div id="defence-box">
      {defences.map((defence, index) => {
        return (
          <DefenceMechanism
            name={defence.name}
            id={defence.id}
            info={defence.info}
            key={defence.id}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
