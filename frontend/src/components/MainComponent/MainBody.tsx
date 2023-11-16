import { useState } from "react";

import "./MainBody.css";

import { LEVELS } from "@src/Levels";
import ChatBox from "@src/components/ChatBox/ChatBox";
import ControlPanel from "@src/components/ControlPanel/ControlPanel";
import EmailBox from "@src/components/EmailBox/EmailBox";
import ShortMissionInfoButton from "@src/components/ShortMissionInfoButton/ShortMissionInfoButton";
import { ChatMessage } from "@src/models/chat";
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "@src/models/defence";
import { EmailInfo } from "@src/models/email";
import { LEVEL_NAMES } from "@src/models/level";

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
  incrementNumCompletedLevels,
  openInfoOverlay,
  openLevelsCompleteOverlay,
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
  incrementNumCompletedLevels: (level: LEVEL_NAMES) => void;
  openInfoOverlay: () => void;
  openLevelsCompleteOverlay: () => void;
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
    <main className="main-area">
      <div className="side-bar">
        <ControlPanel
          currentLevel={currentLevel}
          defences={defences}
          setDefenceActive={setDefenceActive}
          setDefenceInactive={setDefenceInactive}
          setDefenceConfiguration={setDefenceConfiguration}
          openWelcomeOverlay={openWelcomeOverlay}
        />
      </div>
      <div className="centre-area">
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
          incrementNumCompletedLevels={incrementNumCompletedLevels}
          setEmails={setEmails}
          openLevelsCompleteOverlay={openLevelsCompleteOverlay}
        />
      </div>
      <div className="side-bar">
        <EmailBox emails={emails} />
      </div>
    </main>
  );
}

export default MainBody;
