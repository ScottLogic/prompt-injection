import "./App.css";
import "./Theme.css";
import MainHeader from "./components/MainComponent/MainHeader";
import MainBody from "./components/MainComponent/MainBody";
import { useEffect, useState } from "react";
import { PHASE_NAMES } from "./models/phase";
import {
  getChatHistory,
  clearChat,
  addMessageToChatHistory,
  resetGPTModelConfigs,
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
import { DEFENCE_DETAILS_ALL, DEFENCE_DETAILS_PHASE } from "./Defences";
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "./models/defence";
import { getCompletedPhases } from "./service/phaseService";
import { PHASES } from "./Phases";

function App() {
  const [MainBodyKey, setMainBodyKey] = useState<number>(0);
  // start on sandbox mode
  const [currentPhase, setCurrentPhase] = useState<PHASE_NAMES>(
    PHASE_NAMES.SANDBOX
  );
  const [numCompletedPhases, setNumCompletedPhases] = useState<number>(0);

  const [defencesToShow, setDefencesToShow] =
    useState<DefenceInfo[]>(DEFENCE_DETAILS_ALL);

  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // called on mount
  useEffect(() => {
    getCompletedPhases()
      .then((numCompletedPhases) => {
        setNumCompletedPhases(numCompletedPhases);
      })
      .catch((err) => {
        console.log(err);
      });
    void setNewPhase(currentPhase);
  }, []);

  // methods to modify messages
  function addChatMessage(message: ChatMessage) {
    setMessages((messages: ChatMessage[]) => [...messages, message]);
  }

  // for clearing phase progress
  async function resetPhase() {
    console.log(`resetting phase ${currentPhase}`);

    await clearChat(currentPhase);
    setMessages([]);
    // add preamble to start of chat
    addChatMessage({
      message: PHASES[currentPhase].preamble,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
    });

    await clearEmails(currentPhase);
    setEmails([]);

    await resetActiveDefences(currentPhase);
    // choose appropriate defences to display
    let defences =
      currentPhase === PHASE_NAMES.PHASE_2
        ? DEFENCE_DETAILS_PHASE
        : DEFENCE_DETAILS_ALL;
    defences = defences.map((defence) => {
      defence.isActive = false;
      return defence;
    });
    setDefencesToShow(defences);
  }

  // for going switching phase without clearing progress
  async function setNewPhase(newPhase: PHASE_NAMES) {
    console.log(`changing phase from ${currentPhase} to ${newPhase}`);
    setMessages([]);
    setCurrentPhase(newPhase);

    // get emails for new phase from the backend
    const phaseEmails = await getSentEmails(newPhase);
    setEmails(phaseEmails);

    // get chat history for new phase from the backend
    const phaseChatHistory = await getChatHistory(newPhase);
    // add the preamble to the start of the chat history
    phaseChatHistory.unshift({
      message: PHASES[newPhase].preamble,
      type: CHAT_MESSAGE_TYPE.PHASE_INFO,
    });
    setMessages(phaseChatHistory);

    const defences =
      newPhase === PHASE_NAMES.PHASE_2
        ? DEFENCE_DETAILS_PHASE
        : DEFENCE_DETAILS_ALL;
    // fetch defences from backend
    const remoteDefences = await getDefences(newPhase);
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
    void addMessageToChatHistory(message, CHAT_MESSAGE_TYPE.INFO, currentPhase);
  }

  async function setDefenceActive(defence: DefenceInfo) {
    await activateDefence(defence.id, currentPhase);
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
    await deactivateDefence(defence.id, currentPhase);
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
    const success = await configureDefence(defenceId, config, currentPhase);
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
      <div id="app-content-header">
        <MainHeader
          currentPhase={currentPhase}
          numCompletedPhases={numCompletedPhases}
          setNewPhase={(newPhase) => void setNewPhase(newPhase)}
        />
      </div>
      <div id="app-content-body">
        <MainBody
          key={MainBodyKey}
          currentPhase={currentPhase}
          defences={defencesToShow}
          emails={emails}
          messages={messages}
          addChatMessage={addChatMessage}
          resetPhase={() => void resetPhase()}
          setDefenceActive={(defence) => void setDefenceActive(defence)}
          setDefenceInactive={(defence) => void setDefenceInactive(defence)}
          setDefenceConfiguration={setDefenceConfiguration}
          setEmails={setEmails}
          setNumCompletedPhases={setNumCompletedPhases}
        />
      </div>
    </div>
  );
}

export default App;
