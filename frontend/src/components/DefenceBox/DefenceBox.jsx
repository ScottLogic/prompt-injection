import { useEffect, useState } from "react";
import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getDefenceStatus,
  activateDefence,
  deactivateDefence,
} from "../../service/defenceService";

function DefenceBox() {
  // list of defence mechanisms
  const [defences, setDefences] = useState([
    {
      name: "character limit",
      id: "CHARACTER_LIMIT",
      info: "limit the number of characters in the user input. this is a form of prompt validation.",
      isActive: false,
    },
  ]);

  useEffect(() => {
    // fetch defences from backend
    getDefenceStatus().then((defenceStatus) => {
      const newDefences = defences.map((defence) => {
        const matchingDefence = defenceStatus.find((defence) => {
          return defence.id === defence.id;
        });
        defence.isActive = matchingDefence.isActive;
        return defence;
      });
      setDefences(newDefences);
    });
  }, []);

  const setDefenceActive = (defenceId) => {
    activateDefence(defenceId).then(() => {
      // update state
      const newDefences = defences.map((defence) => {
        if (defence.id === defenceId) {
          defence.isActive = true;
        }
        return defence;
      });
      setDefences(newDefences);
    });
  };

  const setDefenceInactive = (defenceId) => {
    deactivateDefence(defenceId).then(() => {
      // update state
      const newDefences = defences.map((defence) => {
        if (defence.id === defenceId) {
          defence.isActive = false;
        }
        return defence;
      });
      setDefences(newDefences);
    });
  };

  return (
    <div id="defence-box">
      {defences.map((defence, index) => {
        return (
          <DefenceMechanism
            key={defence.id}
            name={defence.name}
            id={defence.id}
            info={defence.info}
            isActive={defence.isActive}
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
