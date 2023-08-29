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
  currentPhase,
  defences,
  showConfigurations,
  defenceActivated,
  defenceDeactivated,
}: {
  currentPhase: number;
  defences: DefenceInfo[];
  showConfigurations: boolean;
  defenceActivated: (defenceInfo: DefenceInfo) => void;
  defenceDeactivated: (defenceInfo: DefenceInfo) => void;
}) {
  // list of defence mechanisms
  const [defenceDetails, setDefenceDetails] = useState(defences);

  useEffect(() => {
    setDefenceDetails(defences);
  }, [defences]);

  // called on mount & when switchPhase is called
  useEffect(() => {
    // fetch defences from backend
    getDefences(currentPhase).then((remoteDefences) => {
      defenceDetails.map((localDefence) => {
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
    });
  }, [defences]);

  const setDefenceActive = (defenceType: string) => {
    activateDefence(defenceType, currentPhase).then(() => {
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
    deactivateDefence(defenceType, currentPhase).then(() => {
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
    const configSuccess = configureDefence(
      defenceId,
      config,
      currentPhase
    ).then((success) => {
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
    });
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
            showConfigurations={showConfigurations}
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
