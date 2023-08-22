import { useEffect, useState } from "react";
import "../StrategyBox/StrategyBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getDefences,
  activateDefence,
  deactivateDefence,
  configureDefence,
} from "../../service/defenceService";
import { DefenceConfig, DefenceInfo } from "../../models/defence";

function DefenceBox({
  defences,
  triggeredDefences,
  currentPhase,
  defenceActivated,
  defenceDeactivated,
}: {
  defences: DefenceInfo[];
  triggeredDefences: string[];
  currentPhase: number;
  defenceActivated: (defenceInfo: DefenceInfo) => void;
  defenceDeactivated: (defenceInfo: DefenceInfo) => void;
}) {
  // list of defence mechanisms
  const [defenceDetails, setDefenceDetails] = useState(defences);

  useEffect(() => {
    setDefenceDetails(defences);
  }, [defences]);

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
            matchingRemoteDefence.config.forEach((configEntry) => {
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
    const configSuccess = configureDefence(defenceId, config).then(
      (success) => {
        if (success) {
          // update state
          const newDefences = defenceDetails.map((defence) => {
            if (defence.id === defenceId) {
              defence.config = config;
            }
            return defence;
          });
          setDefenceDetails(newDefences);
        }
        return success;
      }
    );
    return configSuccess;
  };

  return (
    <div id="strategy-box">
      <div className="side-bar-header">defence mechanisms</div>
      {defenceDetails.map((defenceDetail, index) => {
        return (
          <DefenceMechanism
            key={index}
            defenceDetail={defenceDetail}
            currentPhase={currentPhase}
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
