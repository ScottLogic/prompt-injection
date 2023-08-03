import { useState } from "react";
import { DefenceInfo } from "../../models/defence";
import "./DefenceMechanism.css";

const ANIMATION_FLASH_TIME_SECONDS = 1;
const ANIMATION_FLASH_REPEAT = 3;

function DefenceMechanism({
  key,
  defenceDetail,
  setDefenceActive,
  setDefenceInactive,
}: {
  key: number;
  defenceDetail: DefenceInfo;
  setDefenceActive: (defenceId: string) => void;
  setDefenceInactive: (defenceId: string) => void;
}) {
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState<boolean>(false);

  return (
    <span>
      <div
        key={key}
        className={
          defenceDetail.isActive
            ? "defence-mechanism defence-active"
            : "defence-mechanism"
        }
        style={
          defenceDetail.isTriggered
            ? defenceDetail.isActive
              ? {
                  animation:
                    "flash-red-active " +
                    ANIMATION_FLASH_TIME_SECONDS +
                    "s linear 0s " +
                    ANIMATION_FLASH_REPEAT +
                    " forwards",
                }
              : {
                  animation:
                    "flash-red-inactive " +
                    ANIMATION_FLASH_TIME_SECONDS +
                    "s linear 0s " +
                    ANIMATION_FLASH_REPEAT +
                    " forwards",
                }
            : { animation: "none" }
        }
        onClick={() => {
          defenceDetail.isActive
            ? setDefenceInactive(defenceDetail.id)
            : setDefenceActive(defenceDetail.id);
        }}
      >
        <div className="defence-mechanism-header">
          <span className="defence-mechanism-name">{defenceDetail.name}</span>
          <span
            className="defence-mechanism-info"
            onMouseOver={() => {
              setIsInfoBoxVisible(true);
            }}
            onMouseLeave={() => {
              setIsInfoBoxVisible(false);
            }}
          >
            <span>?</span>
          </span>
        </div>
        {isInfoBoxVisible ? (
          <div className="defence-mechanism-info-box">{defenceDetail.info}</div>
        ) : null}
      </div>
    </span>
  );
}

export default DefenceMechanism;
