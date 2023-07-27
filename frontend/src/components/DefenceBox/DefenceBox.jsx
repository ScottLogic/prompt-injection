import { useEffect, useState } from "react";
import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getDefences,
  activateDefence,
  deactivateDefence,
  configureDefence,
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
        configuration: defence.configuration?.map((config) => {
          return { ...config, value: "" };
        }),
      };
    })
  );

  // called on mount
  useEffect(() => {
    // fetch defences from backend
    getDefences().then((remoteDefences) => {
      const newDefences = defences.map((localDefence) => {
        const matchingRemoteDefence = remoteDefences.find((remoteDefence) => {
          return localDefence.id === remoteDefence.id;
        });
        localDefence.isActive = matchingRemoteDefence.isActive;
        // set each configuration value
        if (matchingRemoteDefence.configuration && localDefence.configuration) {
          // loop over remote configuration values
          matchingRemoteDefence.configuration.forEach((configEntry, index) => {
            // get the matching configuration in the local defence
            const matchingConfig = localDefence.configuration.find((config) => {
              return config.id === configEntry.id;
            });
            // set the value
            matchingConfig.value = configEntry.value;
          });
        }
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

  const setDefenceConfiguration = (defenceId, configuration) => {
    configureDefence(defenceId, configuration).then(() => {
      // update state
      const newDefences = defences.map((defence) => {
        if (defence.id === defenceId) {
          defence.configuration = configuration;
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
            defence={defence}
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
            setDefenceConfiguration={setDefenceConfiguration}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
