import { useEffect, useState } from "react";
import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getActiveDefences,
  activateDefence,
  deactivateDefence,
} from "../../service/defenceService";
import DEFENCES from "../../Defences";

function DefenceBox(props) {
  // list of defence mechanisms
  const [defences, setDefences] = useState(
    DEFENCES.map((defence) => {
      return {
        ...defence,
        isActive: false,
        isTriggered: false,
      };
    })
  );

  // called on mount
  useEffect(() => {
    // fetch defences from backend
    getActiveDefences().then((activeDefences) => {
      const newDefences = defences.map((localDefence) => {
        localDefence.isActive = activeDefences.find((remoteDefence) => {
          return localDefence.id === remoteDefence;
        });
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
