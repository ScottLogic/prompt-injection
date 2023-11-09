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
  incrementNumCompletedLevels,
  openInfoOverlay,
  openLevelsCompleteOverlay,
  openWelcomeOverlay,
  openDocumentViewer,
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
  openDocumentViewer: () => void;
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
          openDocumentViewer={openDocumentViewer}
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
