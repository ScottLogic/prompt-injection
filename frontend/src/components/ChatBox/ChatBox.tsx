import { useEffect, useState } from "react";
import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import {
  addInfoMessageToHistory,
  sendMessage,
} from "../../service/chatService";
import { getSentEmails } from "../../service/emailService";
import {
  CHAT_MESSAGE_TYPE,
  ChatMessage,
  ChatResponse,
} from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PHASE_NAMES } from "../../models/phase";
import { DEFENCE_DETAILS_ALL } from "../../Defences";

function ChatBox(
  this: any,
  {
    messages,
    currentPhase,
    addChatMessage,
    resetPhase,
    setNumCompletedPhases,
    setEmails,
  }: {
    messages: ChatMessage[];
    currentPhase: PHASE_NAMES;
    addChatMessage: (message: ChatMessage) => void;
    resetPhase: () => void;
    setNumCompletedPhases: (numCompletedPhases: number) => void;
    setEmails: (emails: EmailInfo[]) => void;
  }
) {
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // called on mount
  useEffect(() => {
    // get sent emails
    getSentEmails(currentPhase).then((sentEmails) => {
      setEmails(sentEmails);
    });
  }, [setEmails]);

  const sendChatMessage = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && event.target !== null && !isSendingMessage) {
      setIsSendingMessage(true);
      // get the message
      const message = event.currentTarget.value;

      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message: message,
        type: CHAT_MESSAGE_TYPE.USER,
        isOriginalMessage: true,
      });
      // clear the input
      event.currentTarget.value = "";

      const response: ChatResponse = await sendMessage(message, currentPhase);
      setNumCompletedPhases(response.numPhasesCompleted);
      const transformedMessage = response.transformedMessage;
      const isTransformed = transformedMessage !== message;
      // add the transformed message to the chat box if it is different from the original message
      if (isTransformed) {
        addChatMessage({
          message: transformedMessage,
          type: CHAT_MESSAGE_TYPE.USER,
          isOriginalMessage: false,
        });
      }
      // add it to the list of messages
      addChatMessage({
        type: CHAT_MESSAGE_TYPE.BOT,
        message: response.reply,
        defenceInfo: response.defenceInfo,
        isOriginalMessage: true,
      });
      // add triggered defences to the chat
      response.defenceInfo.triggeredDefences.forEach((triggeredDefence) => {
        // get user-friendly defence name
        const defenceName = DEFENCE_DETAILS_ALL.find((defence) => {
          return defence.id === triggeredDefence;
        })?.name.toLowerCase();
        if (defenceName) {
          addChatMessage({
            type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
            message: `${defenceName} defence triggered`,
            isOriginalMessage: true,
          });
          addInfoMessageToHistory(
            `${defenceName} defence triggered`,
            CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
            currentPhase
          );
        }
      });

      // we have the message reply
      setIsSendingMessage(false);

      // get sent emails
      const sentEmails: EmailInfo[] = await getSentEmails(currentPhase);
      // update emails
      setEmails(sentEmails);

      if (response.wonPhase) {
        const successMessage =
          "Congratulations! You have completed this phase. Please click on the next phase to continue.";
        addChatMessage({
          type: CHAT_MESSAGE_TYPE.PHASE_INFO,
          message: successMessage,
          defenceInfo: response.defenceInfo,
          isOriginalMessage: true,
        });
        addInfoMessageToHistory(
          successMessage,
          CHAT_MESSAGE_TYPE.PHASE_INFO,
          currentPhase
        );
      }
    }
  };

  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} />
      <div id="chat-box-footer">
        <input
          id="chat-box-input"
          className="prompt-injection-input"
          type="text"
          placeholder="chat to chatgpt..."
          autoFocus
          onKeyUp={sendChatMessage.bind(this)}
        />
        <button
          id="chat-box-button"
          className="prompt-injection-button"
          onClick={resetPhase.bind(this)}
        >
          reset
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
