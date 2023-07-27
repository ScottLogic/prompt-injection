import React from "react";
import { useEffect, useState } from "react";
import "./DefenceBox.css";
import DefenceMechanism from "./DefenceMechanism";
import {
  getActiveDefences,
  activateDefence,
  deactivateDefence,
  DEFENCE_DETAILS,
} from "../../service/defenceService";

function DefenceBox({ triggeredDefences }: { triggeredDefences: string[] }) {
  // list of defence mechanisms
  const [defenceDetails, setDefenceDetails] = useState(
    DEFENCE_DETAILS.map((defence) => {
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
      const newDefencesDetails = defenceDetails.map((defencesDetail) => {
        defencesDetail.isActive = activeDefences.includes(defencesDetail.type);
        return defencesDetail;
      });
      setDefenceDetails(newDefencesDetails);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update triggered defences
  useEffect(() => {
    console.log("updating triggered defences: ", triggeredDefences);
    // update state
    const newDefences = defenceDetails.map((defenceDetail) => {
      defenceDetail.isTriggered = triggeredDefences.includes(
        defenceDetail.type
      );
      return defenceDetail;
    });
    setDefenceDetails(newDefences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggeredDefences]);

  const setDefenceActive = (defenceType: string) => {
    activateDefence(defenceType).then(() => {
      // update state
      const newDefenceDetails = defenceDetails.map((defenceDetail) => {
        if (defenceDetail.type === defenceType) {
          defenceDetail.isActive = true;
          defenceDetail.isTriggered = false;
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
        if (defenceDetail.type === defenceType) {
          defenceDetail.isActive = false;
          defenceDetail.isTriggered = false;
        }
        return defenceDetail;
      });
      setDefenceDetails(newDefenceDetails);
    });
  };

  useEffect(() => {
    console.log("defenceDetails: ", defenceDetails);
  }, [defenceDetails]);

  return (
    <div id="defence-box">
      {defenceDetails.map((defenceDetail, index) => {
        return (
          <DefenceMechanism
            key={index}
            defenceDetail={defenceDetail}
            setDefenceActive={setDefenceActive}
            setDefenceInactive={setDefenceInactive}
          />
        );
      })}
    </div>
  );
}

export default DefenceBox;
