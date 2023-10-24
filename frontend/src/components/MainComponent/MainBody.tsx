import "./MainBody.css";
import { ChatMessage } from "../../models/chat";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { LEVEL_NAMES } from "../../models/level";
import ChatBox from "../ChatBox/ChatBox";
import EmailBox from "../EmailBox/EmailBox";
import { EmailInfo } from "../../models/email";
import { useState } from "react";
import ControlPanel from "../ControlPanel/ControlPanel";
import ShortMissionInfoButton from "../ShortMissionInfoButton/ShortMissionInfoButton";
import { LEVELS } from "../../Levels";

function MainBody({
  currentLevel,
  defences,
  emails,
  messages,
  addChatMessage,
  resetLevel,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
  setEmails,
  setNumCompletedLevels,
  openInfoOverlay,
  openWelcomeOverlay,
}: {
  currentLevel: LEVEL_NAMES;
  defences: DefenceInfo[];
  emails: EmailInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  resetLevel: () => void;
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) => Promise<boolean>;
  setEmails: (emails: EmailInfo[]) => void;
  setNumCompletedLevels: (numCompletedLevels: number) => void;
  openInfoOverlay: () => void;
  openWelcomeOverlay: () => void;
}) {
  const [completedLevels, setCompletedLevels] = useState<Set<LEVEL_NAMES>>(
    new Set()
  );

  function resetLevelBody() {
    completedLevels.delete(currentLevel);
    setCompletedLevels(completedLevels);
    resetLevel();
  }

  function addCompletedLevel(level: LEVEL_NAMES) {
    completedLevels.add(level);
    setCompletedLevels(completedLevels);
  }

  return (
    <span id="main-area">
      <div className="side-bar">
        <ControlPanel
          currentLevel={currentLevel}
          defences={defences}
          messages={messages}
          addChatMessage={addChatMessage}
          setDefenceActive={setDefenceActive}
          setDefenceInactive={setDefenceInactive}
          setDefenceConfiguration={setDefenceConfiguration}
          setEmails={setEmails}
          setNumCompletedLevels={setNumCompletedLevels}
          openWelcomeOverlay={openWelcomeOverlay}
        />
      </div>
      <div id="centre-area">
        {LEVELS[currentLevel].missionInfoShort && (
          <ShortMissionInfoButton
            currentLevel={currentLevel}
            openOverlay={openInfoOverlay}
          />
        )}
        <ChatBox
          completedLevels={completedLevels}
          currentLevel={currentLevel}
          emails={emails}
          messages={messages}
          addChatMessage={addChatMessage}
          addCompletedLevel={addCompletedLevel}
          resetLevel={resetLevelBody}
          setNumCompletedLevels={setNumCompletedLevels}
          setEmails={setEmails}
        />
      </div>
      <div className="side-bar">
        <EmailBox emails={emails} />
      </div>
    </span>
  );
}

export default MainBody;
