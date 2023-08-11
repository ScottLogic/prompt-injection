import { useEffect, useState } from "react";
import "../StrategyBox/StrategyBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getDefences,
  activateDefence,
  deactivateDefence,
  configureDefence,
} from "../../service/defenceService";
import { DEFENCE_DETAILS } from "../../Defences";
import { DefenceConfig, DefenceInfo } from "../../models/defence";

function DefenceBox({
  triggeredDefences,
  defenceActivated,
  defenceDeactivated,
}: {
  triggeredDefences: string[];
  defenceActivated: (defenceInfo: DefenceInfo) => void;
  defenceDeactivated: (defenceInfo: DefenceInfo) => void;
}) {
  // list of defence mechanisms
  const [defenceDetails, setDefenceDetails] = useState(DEFENCE_DETAILS);

  // called on mount
  useEffect(() => {
    // fetch defences from backend
    getDefences().then((remoteDefences) => {
      const newDefences = defenceDetails.map((localDefence) => {
        const matchingRemoteDefence = remoteDefences.find((remoteDefence) => {
          return localDefence.id === remoteDefence.id;
        });
        if (matchingRemoteDefence) {
          localDefence.isActive = matchingRemoteDefence.isActive;
          // set each config value
          if (matchingRemoteDefence.config && localDefence.config) {
            matchingRemoteDefence.config.forEach((configEntry, index) => {
              // get the matching config in the local defence
              const matchingConfig = localDefence.config.find((config) => {
                return config.id === configEntry.id;
              });
              if (matchingConfig) {
                matchingConfig.value = configEntry.value;
              }
            });
          }
        }
        return localDefence;
      });
      setDefenceDetails(newDefences);
    });
  }, []);

  // update triggered defences
  useEffect(() => {
    console.log("updating triggered defences: ", triggeredDefences);
    // update state
    const newDefences = defenceDetails.map((defenceDetail) => {
      defenceDetail.isTriggered = triggeredDefences.includes(defenceDetail.id);
      return defenceDetail;
    });
    setDefenceDetails(newDefences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggeredDefences]);

  const setDefenceActive = (defenceType: string) => {
    activateDefence(defenceType).then(() => {
      // update state
      const newDefenceDetails = defenceDetails.map((defenceDetail) => {
        if (defenceDetail.id === defenceType) {
          defenceDetail.isActive = true;
          defenceDetail.isTriggered = false;
          defenceActivated(defenceDetail);
        }
        return defenceDetail;
      });
      setDefenceDetails(newDefenceDetails);
    });
  };

  const setDefenceInactive = (defenceType: string) => {
    deactivateDefence(defenceType).then(() => {
      // update state
      const newDefenceDetails = defenceDetails.map((defenceDetail) => {
        if (defenceDetail.id === defenceType) {
          defenceDetail.isActive = false;
          defenceDetail.isTriggered = false;
          defenceDeactivated(defenceDetail);
        }
        return defenceDetail;
      });
      setDefenceDetails(newDefenceDetails);
    });
  };

  const setDefenceConfiguration = (
    defenceId: string,
    config: DefenceConfig[]
  ) => {
    configureDefence(defenceId, config).then(() => {
      // update state
      const newDefences = defenceDetails.map((defence) => {
        if (defence.id === defenceId) {
          defence.config = config;
        }
        return defence;
      });
      setDefenceDetails(newDefences);
    });
  };

  useEffect(() => {
    console.log("defenceDetails: ", defenceDetails);
  }, [defenceDetails]);

  return (
    <div id="strategy-box">
      {defenceDetails.map((defenceDetail, index) => {
        return (
          <DefenceMechanism
            key={index}
            defenceDetail={defenceDetail}
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
