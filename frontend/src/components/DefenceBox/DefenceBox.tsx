import { useEffect, useState } from "react";
import "../StrategyBox/StrategyBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getDefences,
  activateDefence,
  deactivateDefence,
  configureDefence,
} from "../../service/defenceService";
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "../../models/defence";

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

  // called on mount & when defences are updated
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
        return localDefence;
      });
    }).catch((err) => {
      console.log(err);
    });
  }, [defences]);

  async function setDefenceActive(defenceId: DEFENCE_TYPES) {
    await activateDefence(defenceId, currentPhase)
    // update state
    const newDefenceDetails = defenceDetails.map((defenceDetail) => {
      if (defenceDetail.id === defenceId) {
        defenceDetail.isActive = true;
        defenceDetail.isTriggered = false;
        defenceActivated(defenceDetail);
      }
      return defenceDetail;
    });
    setDefenceDetails(newDefenceDetails);
  }

  async function setDefenceInactive(defenceId: DEFENCE_TYPES) {
    await deactivateDefence(defenceId, currentPhase);
    // update state
    const newDefenceDetails = defenceDetails.map((defenceDetail) => {
      if (defenceDetail.id === defenceId) {
        defenceDetail.isActive = false;
        defenceDetail.isTriggered = false;
        defenceDeactivated(defenceDetail);
      }
      return defenceDetail;
    });
    setDefenceDetails(newDefenceDetails);
  }

  async function setDefenceConfiguration(
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) {
    const success = await configureDefence(
      defenceId,
      config,
      currentPhase
    );
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

  return (
    <div id="strategy-box">
      <div className="side-bar-header">Defences</div>
      {defenceDetails.map((defenceDetail, index) => {
        return (
          <DefenceMechanism
            key={index}
            defenceDetail={defenceDetail}
            showConfigurations={showConfigurations}
            setDefenceActive={(defenceId) => void setDefenceActive(defenceId)}
            setDefenceInactive={(defenceId) => void setDefenceInactive(defenceId)}
            setDefenceConfiguration={setDefenceConfiguration}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
