import { useEffect, useState } from "react";

import MainBody from "./MainBody";
import "./MainComponent.css";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";

import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_LEVEL } from "@src/Defences";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "@src/models/chat";
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "@src/models/defence";
import { EmailInfo } from "@src/models/email";
import { LEVEL_NAMES } from "@src/models/level";
import {
  addMessageToChatHistory,
  clearChat,
  getChatHistory,
} from "@src/service/chatService";
import {
  activateDefence,
  configureDefence,
  deactivateDefence,
  getDefences,
  resetActiveDefences,
} from "@src/service/defenceService";
import { clearEmails, getSentEmails } from "@src/service/emailService";

function MainComponent({
  currentLevel,
  numCompletedLevels,
  openHandbook,
  openInformationOverlay,
  openLevelsCompleteOverlay,
  openWelcomeOverlay,
  setCurrentLevel,
  incrementNumCompletedLevels
}: {
  currentLevel: LEVEL_NAMES;
  numCompletedLevels: number;
  openHandbook: () => void;
  openInformationOverlay: () => void;
  openLevelsCompleteOverlay: () => void;
  openWelcomeOverlay: () => void;
  setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
  incrementNumCompletedLevels: (level: number) => void;
}) {
  const [MainBodyKey, setMainBodyKey] = useState<number>(0);
  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    void setNewLevel(currentLevel);
  }, [currentLevel]);

  // methods to modify messages
  function addChatMessage(message: ChatMessage) {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  }

  // for clearing level progress
  async function resetLevel() {
    await clearChat(currentLevel);
    setMessages([]);
    currentLevel !== LEVEL_NAMES.SANDBOX && addWelcomeMessage();

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
    // get emails for new level from the backend
    const levelEmails = await getSentEmails(newLevel);
    setEmails(levelEmails);

    // get chat history for new level from the backend
    const levelChatHistory = await getChatHistory(newLevel);

    setMessages(levelChatHistory);
    // add welcome message for levels only
    newLevel !== LEVEL_NAMES.SANDBOX && addWelcomeMessage();

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

  function addWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      message: `Hello! I'm ScottBrewBot, your personal AI work assistant. You can ask me for information or to help you send emails. What can I do for you?`,
      type: CHAT_MESSAGE_TYPE.BOT,
    };
    setMessages((messages: ChatMessage[]) => [welcomeMessage, ...messages]);
  }

  return (
    <div className="main-component">
      <MainHeader
        currentLevel={currentLevel}
        numCompletedLevels={numCompletedLevels}
        openHandbook={openHandbook}
        setCurrentLevel={setCurrentLevel}
      />
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
      <MainFooter />
    </div>
  );
}

export default MainComponent;
