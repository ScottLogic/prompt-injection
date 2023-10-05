import "./App.css";
import "./Theme.css";
import MainHeader from "./components/MainComponent/MainHeader";
import MainBody from "./components/MainComponent/MainBody";
import { useEffect, useState } from "react";
import { LEVEL_NAMES } from "./models/level";
import {
  getChatHistory,
  clearChat,
  addMessageToChatHistory,
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
import { getCompletedLevels } from "./service/levelService";
import { LEVELS } from "./Levels";
import HandbookOverlay from "./components/HandbookOverlay/HandbookOverlay";
import { OVERLAY_TYPE } from "./models/overlay";

function App({ isNewUser }: { isNewUser: boolean }) {
  const [MainBodyKey, setMainBodyKey] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<LEVEL_NAMES>(
    loadCurrentLevel()
  );
  const [numCompletedLevels, setNumCompletedLevels] = useState<number>(0);

  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);

  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [overlayType, setOverlayType] = useState<OVERLAY_TYPE>(
    OVERLAY_TYPE.WELCOME
  );

  function loadCurrentLevel() {
    // get current level from local storage
    const currentLevelStr = localStorage.getItem("currentLevel");
    if (currentLevelStr) {
      // start the user from where they last left off
      return parseInt(currentLevelStr);
    } else {
      // by default, start on level 1
      return LEVEL_NAMES.LEVEL_1;
    }
  }

  // called on mount
  useEffect(() => {
    getCompletedLevels()
      .then((numCompletedLevels) => {
        setNumCompletedLevels(numCompletedLevels);
      })
      .catch((err) => {
        console.error(err);
      });
    void setNewLevel(currentLevel);
    // show the welcome overlay if this is a new user
    if (isNewUser) {
      const modalDialog = document.querySelector("dialog");
      modalDialog?.showModal();
    }
  }, []);

  useEffect(() => {
    // save current level to local storage
    localStorage.setItem("currentLevel", currentLevel.toString());
  }, [currentLevel]);

  function closeOverlay() {
    const modalDialog = document.querySelector("dialog");
    modalDialog?.close();
  }

  function openHandbook() {
    setOverlayType(OVERLAY_TYPE.HANDBOOK);
    const modalDialog = document.querySelector("dialog");
    modalDialog?.showModal();
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
    // add preamble to start of chat
    addChatMessage({
      message: LEVELS[currentLevel].preamble,
      type: CHAT_MESSAGE_TYPE.LEVEL_INFO,
    });

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

  // for going switching level without clearing progress
  async function setNewLevel(newLevel: LEVEL_NAMES) {
    console.log(`changing level from ${currentLevel} to ${newLevel}`);
    setMessages([]);
    setCurrentLevel(newLevel);

    // get emails for new level from the backend
    const levelEmails = await getSentEmails(newLevel);
    setEmails(levelEmails);

    // get chat history for new level from the backend
    const levelChatHistory = await getChatHistory(newLevel);
    // add the preamble to the start of the chat history
    levelChatHistory.unshift({
      message: LEVELS[newLevel].preamble,
      type: CHAT_MESSAGE_TYPE.LEVEL_INFO,
    });
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
    <div id="app-content">
      <HandbookOverlay
        currentLevel={currentLevel}
        overlayType={overlayType}
        closeOverlay={closeOverlay}
      />
      <header id="app-content-header">
        <MainHeader
          currentLevel={currentLevel}
          numCompletedLevels={numCompletedLevels}
          openHandbook={openHandbook}
          setNewLevel={(newLevel: LEVEL_NAMES) => void setNewLevel(newLevel)}
        />
      </header>
      <main id="app-content-body">
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
          setNumCompletedLevels={setNumCompletedLevels}
        />
      </main>
    </div>
  );
}

export default App;
