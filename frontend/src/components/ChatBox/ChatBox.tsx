import { useEffect, useState } from "react";
import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import {
  addMessageToChatHistory,
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
import { ThreeDots } from "react-loader-spinner";

function ChatBox({
  messages,
  completedPhases,
  currentPhase,
  addChatMessage,
  addCompletedPhase,
  setNumCompletedPhases,
  setEmails,
}: {
  messages: ChatMessage[];
  completedPhases: Set<PHASE_NAMES>;
  currentPhase: PHASE_NAMES;
  addChatMessage: (message: ChatMessage) => void;
  addCompletedPhase: (phase: PHASE_NAMES) => void;
  setNumCompletedPhases: (numCompletedPhases: number) => void;
  setEmails: (emails: EmailInfo[]) => void;
}) {
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // called on mount
  useEffect(() => {
    // get sent emails
    getSentEmails(currentPhase)
      .then((sentEmails) => {
        setEmails(sentEmails);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [setEmails]);

  function inputKeyPressed(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // asynchronously send the message
      void sendChatMessage();
    }
  }

  async function sendChatMessage() {
    const inputBoxElement = document.getElementById(
      "chat-box-input"
    ) as HTMLInputElement;
    // get the message from the input box
    const message = inputBoxElement.value;
    // clear the input box
    inputBoxElement.value = "";

    if (message && !isSendingMessage) {
      setIsSendingMessage(true);

      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message: message,
        type: CHAT_MESSAGE_TYPE.USER,
      });

      const response: ChatResponse = await sendMessage(message, currentPhase);
      setNumCompletedPhases(response.numPhasesCompleted);
      const transformedMessage = response.transformedMessage;
      const isTransformed = transformedMessage !== message;
      // add the transformed message to the chat box if it is different from the original message
      if (isTransformed) {
        addChatMessage({
          message: transformedMessage,
          type: CHAT_MESSAGE_TYPE.USER_TRANSFORMED,
        });
      }
      // add it to the list of messages
      if (response.defenceInfo.isBlocked) {
        addChatMessage({
          type: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
          message: response.defenceInfo.blockedReason,
        });
      } else {
        addChatMessage({
          type: CHAT_MESSAGE_TYPE.BOT,
          message: response.reply,
        });
      }
      // add altered defences to the chat
      response.defenceInfo.alertedDefences.forEach((triggeredDefence) => {
        // get user-friendly defence name
        const defenceName = DEFENCE_DETAILS_ALL.find((defence) => {
          return defence.id === triggeredDefence;
        })?.name.toLowerCase();
        if (defenceName) {
          const alertMsg = `your last message would have triggered the ${defenceName} defence`;
          addChatMessage({
            type: CHAT_MESSAGE_TYPE.DEFENCE_ALERTED,
            message: alertMsg,
          });
          // asynchronously add the message to the chat history
          void addMessageToChatHistory(
            alertMsg,
            CHAT_MESSAGE_TYPE.DEFENCE_ALERTED,
            currentPhase
          );
        }
      });
      // add triggered defences to the chat
      response.defenceInfo.triggeredDefences.forEach((triggeredDefence) => {
        // get user-friendly defence name
        const defenceName = DEFENCE_DETAILS_ALL.find((defence) => {
          return defence.id === triggeredDefence;
        })?.name.toLowerCase();
        if (defenceName) {
          const triggerMsg = `${defenceName} defence triggered`;
          addChatMessage({
            type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
            message: triggerMsg,
          });
          // asynchronously add the message to the chat history
          void addMessageToChatHistory(
            triggerMsg,
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

      if (response.wonPhase && !completedPhases.has(currentPhase)) {
        addCompletedPhase(currentPhase);
        const successMessage =
          "Congratulations! You have completed this phase. Please click on the next phase to continue.";
        addChatMessage({
          type: CHAT_MESSAGE_TYPE.PHASE_INFO,
          message: successMessage,
        });
        // asynchronously add the message to the chat history
        void addMessageToChatHistory(
          successMessage,
          CHAT_MESSAGE_TYPE.PHASE_INFO,
          currentPhase
        );
      }
    }
  }
  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} />
      <div id="chat-box-footer">
        <div id="chat-box-footer-messages">
          <input
            id="chat-box-input"
            className="prompt-injection-input"
            type="text"
            placeholder="Type here..."
            autoFocus
            onKeyUp={inputKeyPressed}
          />
          <button
            id="chat-box-button-send"
            className="prompt-injection-button"
            disabled={isSendingMessage}
            onClick={() => void sendChatMessage()}
          >
            <span id="chat-box-button-content">
              {isSendingMessage ? (
                <ThreeDots width="24px" color="white" />
              ) : (
                "Send"
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
