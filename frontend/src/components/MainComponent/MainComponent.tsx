import MainHeader from "./MainHeader";
import MainBody from "./MainBody";
import { useEffect, useState } from "react";
import { LEVEL_NAMES } from "../../models/level";
import {
  addMessageToChatHistory,
  clearChat,
  getChatHistory,
} from "../../service/chatService";
import { EmailInfo } from "../../models/email";
import { clearEmails, getSentEmails } from "../../service/emailService";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";
import {
  activateDefence,
  configureDefence,
  deactivateDefence,
  getDefences,
  resetActiveDefences,
} from "../../service/defenceService";
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_LEVEL } from "../../Defences";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import "./MainComponent.css";

function MainComponent({
  currentLevel,
  isNewUser,
  openHandbook,
  openInformationOverlay,
  openLevelsCompleteOverlay,
  openWelcomeOverlay,
  setCurrentLevel,
}: {
  currentLevel: LEVEL_NAMES;
  isNewUser: boolean;
  openHandbook: () => void;
  openInformationOverlay: () => void;
  openLevelsCompleteOverlay: () => void;
  openWelcomeOverlay: () => void;
  setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
  const [MainBodyKey, setMainBodyKey] = useState<number>(0);
  const [numCompletedLevels, setNumCompletedLevels] = useState(
    loadNumCompletedLevels
  );
  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);

  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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

  useEffect(() => {
    console.log(`current level changed to ${currentLevel}`);
    void setNewLevel(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    // save number of completed levels to local storage
    localStorage.setItem("numCompletedLevels", numCompletedLevels.toString());
  }, [numCompletedLevels]);

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

  // for going switching level without clearing progress
  async function setNewLevel(newLevel: LEVEL_NAMES) {
    setMessages([]);

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
      message,
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
    <div className="main-component">
      <header>
        <MainHeader
          currentLevel={currentLevel}
          numCompletedLevels={numCompletedLevels}
          openHandbook={openHandbook}
          setCurrentLevel={setCurrentLevel}
        />
      </header>
      <main>
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

export default MainComponent;
