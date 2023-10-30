import "./App.css";
import "./Theme.css";
import MainHeader from "./components/MainComponent/MainHeader";
import MainBody from "./components/MainComponent/MainBody";
import { useEffect, useState } from "react";
import { LEVEL_NAMES } from "./models/level";
import {
  addMessageToChatHistory,
  clearChat,
  getChatHistory,
} from "./service/chatService";
import { EmailInfo } from "./models/email";
import { clearEmails, getSentEmails } from "./service/emailService";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "./models/chat";
import {
  activateDefence,
  configureDefence,
  deactivateDefence,
  getDefences,
  resetActiveDefences,
} from "./service/defenceService";
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_LEVEL } from "./Defences";
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "./models/defence";
import { OVERLAY_TYPE } from "./models/overlay";
import OverlayWelcome from "./components/Overlay/OverlayWelcome";
import MissionInformation from "./components/Overlay/MissionInformation";
import HandbookOverlay from "./components/HandbookOverlay/HandbookOverlay";
import LevelsComplete from "./components/Overlay/LevelsComplete";

function App() {
  const [MainBodyKey, setMainBodyKey] = useState<number>(0);
  const [isNewUser, setIsNewUser] = useState(loadIsNewUser);
  const [currentLevel, setCurrentLevel] =
    useState<LEVEL_NAMES>(loadCurrentLevel);
  const [numCompletedLevels, setNumCompletedLevels] = useState(
    loadNumCompletedLevels
  );
  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);

  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [overlayType, setOverlayType] = useState<OVERLAY_TYPE | null>(null);

  function loadIsNewUser() {
    // get isNewUser from local storage
    const isNewUserStr = localStorage.getItem("isNewUser");
    if (isNewUserStr) {
      return isNewUserStr === "true";
    } else {
      // is new user by default
      return true;
    }
  }

  function loadCurrentLevel() {
    // get current level from local storage
    const currentLevelStr = localStorage.getItem("currentLevel");
    if (currentLevelStr && !isNewUser) {
      // start the user from where they last left off
      return parseInt(currentLevelStr);
    } else {
      // by default, start on level 1
      return LEVEL_NAMES.LEVEL_1;
    }
  }

  function loadNumCompletedLevels() {
    // get number of completed levels from local storage
    const numCompletedLevelsStr = localStorage.getItem("numCompletedLevels");
    if (numCompletedLevelsStr && !isNewUser) {
      // keep users progress from where they last left off
      return parseInt(numCompletedLevelsStr);
    } else {
      // 0 levels completed by default
      return 0;
    }
  }

  function incrementNumCompletedLevels() {
    setNumCompletedLevels(numCompletedLevels + 1);
  }

  // called on mount
  useEffect(() => {
    void setNewLevel(currentLevel);
    if (isNewUser) {
      setOverlayType(OVERLAY_TYPE.WELCOME);
    }
  }, []);

  useEffect(() => {
    // save isNewUser to local storage
    localStorage.setItem("isNewUser", isNewUser.toString());
  }, [isNewUser]);

  useEffect(() => {
    // save current level to local storage
    localStorage.setItem("currentLevel", currentLevel.toString());
  }, [currentLevel]);

  useEffect(() => {
    // save number of completed levels to local storage
    localStorage.setItem("numCompletedLevels", numCompletedLevels.toString());
  }, [numCompletedLevels]);

  function closeOverlay() {
    // open the mission info after welcome page for a new user
    if (overlayType === OVERLAY_TYPE.WELCOME) {
      setIsNewUser(false);
      openInformationOverlay();
    } else {
      setOverlayType(null);
    }
  }

  function openWelcomeOverlay() {
    setOverlayType(OVERLAY_TYPE.WELCOME);
  }
  function openHandbook() {
    setOverlayType(OVERLAY_TYPE.HANDBOOK);
  }
  function openInformationOverlay() {
    setOverlayType(OVERLAY_TYPE.INFORMATION);
  }
  function openLevelsCompleteOverlay() {
    setOverlayType(OVERLAY_TYPE.LEVELS_COMPLETE);
  }

  function openOverlay(overlayType: OVERLAY_TYPE | null) {
    switch (overlayType) {
      case OVERLAY_TYPE.WELCOME:
        return (
          <OverlayWelcome
            currentLevel={currentLevel}
            setStartLevel={(level: LEVEL_NAMES) => void setStartLevel(level)}
            closeOverlay={closeOverlay}
          />
        );
      case OVERLAY_TYPE.INFORMATION:
        return (
          <MissionInformation
            currentLevel={currentLevel}
            closeOverlay={closeOverlay}
          />
        );
      case OVERLAY_TYPE.HANDBOOK:
        return (
          <HandbookOverlay
            currentLevel={currentLevel}
            closeOverlay={closeOverlay}
          />
        );
      case OVERLAY_TYPE.LEVELS_COMPLETE:
        return (
          <LevelsComplete
            goToSandbox={() => void goToSandbox()}
            closeOverlay={closeOverlay}
          />
        );
      default:
        return null;
    }
  }

  // methods to modify messages
  function addChatMessage(message: ChatMessage) {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  }

  // for clearing level progress
  async function resetLevel() {
    console.log(`resetting level ${currentLevel}`);

    await clearChat(currentLevel);
    setMessages([]);

    await clearEmails(currentLevel);
    setEmails([]);

    await resetActiveDefences(currentLevel);
    // choose appropriate defences to display
    let defences =
      currentLevel === LEVEL_NAMES.LEVEL_3
        ? DEFENCE_DETAILS_LEVEL
        : DEFENCE_DETAILS_ALL;
    defences = defences.map((defence) => {
      defence.isActive = false;
      return defence;
    });
    setDefencesToShow(defences);
  }

  // set the start level for a user who clicks beginner/expert
  async function setStartLevel(startLevel: LEVEL_NAMES) {
    if (
      (startLevel === LEVEL_NAMES.LEVEL_1 &&
        currentLevel === LEVEL_NAMES.SANDBOX) ||
      (startLevel === LEVEL_NAMES.SANDBOX &&
        currentLevel !== LEVEL_NAMES.SANDBOX)
    ) {
      console.log(`setting start level to ${startLevel} from ${currentLevel}`);

      await setNewLevel(startLevel);
    }
    // otherwise do nothing as user is already in the selected mode
    closeOverlay();
  }

  async function goToSandbox() {
    await setStartLevel(LEVEL_NAMES.SANDBOX);
    // close the current overlay
    closeOverlay();
    // open the sandbox info overlay
    openInformationOverlay();
  }

  // for going switching level without clearing progress
  async function setNewLevel(newLevel: LEVEL_NAMES) {
    console.log(`changing level from ${currentLevel} to ${newLevel}`);

    if (currentLevel !== newLevel) {
      openInformationOverlay();
    }

    setMessages([]);
    setCurrentLevel(newLevel);

    // get emails for new level from the backend
    const levelEmails = await getSentEmails(newLevel);
    setEmails(levelEmails);

    // get chat history for new level from the backend
    const levelChatHistory = await getChatHistory(newLevel);

    setMessages(levelChatHistory);

    const defences =
      newLevel === LEVEL_NAMES.LEVEL_3
        ? DEFENCE_DETAILS_LEVEL
        : DEFENCE_DETAILS_ALL;
    // fetch defences from backend
    const remoteDefences = await getDefences(newLevel);
    defences.map((localDefence) => {
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
    setDefencesToShow(defences);
    setMainBodyKey(MainBodyKey + 1);
  }

  function addInfoMessage(message: string) {
    addChatMessage({
      message: message,
      type: CHAT_MESSAGE_TYPE.INFO,
    });
    // asynchronously add message to chat history
    void addMessageToChatHistory(message, CHAT_MESSAGE_TYPE.INFO, currentLevel);
  }

  async function setDefenceActive(defence: DefenceInfo) {
    await activateDefence(defence.id, currentLevel);
    // update state
    const newDefenceDetails = defencesToShow.map((defenceDetail) => {
      if (defenceDetail.id === defence.id) {
        defenceDetail.isActive = true;
        defenceDetail.isTriggered = false;
        const infoMessage = `${defence.name} defence activated`;
        addInfoMessage(infoMessage.toLowerCase());
      }
      return defenceDetail;
    });
    setDefencesToShow(newDefenceDetails);
  }

  async function setDefenceInactive(defence: DefenceInfo) {
    await deactivateDefence(defence.id, currentLevel);
    // update state
    const newDefenceDetails = defencesToShow.map((defenceDetail) => {
      if (defenceDetail.id === defence.id) {
        defenceDetail.isActive = false;
        defenceDetail.isTriggered = false;
        const infoMessage = `${defence.name} defence deactivated`;
        addInfoMessage(infoMessage.toLowerCase());
      }
      return defenceDetail;
    });
    setDefencesToShow(newDefenceDetails);
  }

  async function setDefenceConfiguration(
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) {
    const success = await configureDefence(defenceId, config, currentLevel);
    if (success) {
      // update state
      const newDefences = defencesToShow.map((defence) => {
        if (defence.id === defenceId) {
          defence.config = config;
        }
        return defence;
      });
      setDefencesToShow(newDefences);
    }
    return success;
  }
  return (
    <div className="app-content">
      {openOverlay(overlayType)}
      <header className="app-content-header">
        <MainHeader
          currentLevel={currentLevel}
          numCompletedLevels={numCompletedLevels}
          openHandbook={openHandbook}
          setNewLevel={(newLevel: LEVEL_NAMES) => void setNewLevel(newLevel)}
        />
      </header>
      <main className="app-content-body">
        <MainBody
          key={MainBodyKey}
          currentLevel={currentLevel}
          defences={defencesToShow}
          emails={emails}
          messages={messages}
          addChatMessage={addChatMessage}
          resetLevel={() => void resetLevel()}
          setDefenceActive={(defence: DefenceInfo) =>
            void setDefenceActive(defence)
          }
          setDefenceInactive={(defence: DefenceInfo) =>
            void setDefenceInactive(defence)
          }
          setDefenceConfiguration={setDefenceConfiguration}
          setEmails={setEmails}
          incrementNumCompletedLevels={incrementNumCompletedLevels}
          openInfoOverlay={openInformationOverlay}
          openLevelsCompleteOverlay={openLevelsCompleteOverlay}
          openWelcomeOverlay={openWelcomeOverlay}
        />
      </main>
    </div>
  );
}

export default App;
