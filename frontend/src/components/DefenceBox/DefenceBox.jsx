import { useEffect, useState } from "react";
import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getDefenceStatus,
  activateDefence,
  deactivateDefence,
} from "../../service/defenceService";

function DefenceBox(props) {
  // list of defence mechanisms
  const [defences, setDefences] = useState([
    {
      name: "character limit",
      id: "CHARACTER_LIMIT",
      info: "limit the number of characters in the user input. this is a form of prompt validation.",
      isActive: false,
      isTriggered: false,
    },
    {
      name: "random sequence enclosure",
      id: "RANDOM_SEQUENCE_ENCLOSURE",
      info: "enclose the prompt between a random string and instruct bot to only follow. this is a form of prompt validation.", 
      isActive: false,
      isTriggered: false,
    },
    {
      name: "xml tagging", 
      id: "XML_TAGGING",
      info: "enclose the prompt between xml tags. this is a form of prompt validation.",
      isActive: false,
      isTriggered: false,
  }, 

  ]);

  // called on mount
  useEffect(() => {
    // fetch defences from backend
    getDefenceStatus().then((defenceStatus) => {
      const newDefences = defences.map((localDefence) => {
        const matchingDefence = defenceStatus.find((remoteDefence) => {
          return localDefence.id === remoteDefence.id;
        });
        localDefence.isActive = matchingDefence.isActive;
        return localDefence;
      });
      setDefences(newDefences);
    });
  }, []);

  // update triggered defences
  useEffect(() => {
    console.log("updating triggered defences: ", props.triggeredDefences);
    // update state
    const newDefences = defences.map((defence) => {
      defence.isTriggered = props.triggeredDefences.includes(defence.id);
      return defence;
    });
    setDefences(newDefences);
  }, [props.triggeredDefences]);

  const setDefenceActive = (defenceId) => {
    activateDefence(defenceId).then(() => {
      // update state
      const newDefences = defences.map((defence) => {
        if (defence.id === defenceId) {
          defence.isActive = true;
          defence.isTriggered = false;
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
          defence.isTriggered = false;
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
            isTriggered={defence.isTriggered}
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
