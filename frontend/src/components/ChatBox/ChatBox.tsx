import { useEffect, useState } from "react";
import { DEFENCE_DETAILS_ALL } from "../../Defences";
import {
  CHAT_MESSAGE_TYPE,
  ChatMessage,
  ChatResponse,
} from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { LEVEL_NAMES } from "../../models/level";
import {
  addMessageToChatHistory,
  sendMessage,
} from "../../service/chatService";
import { getSentEmails } from "../../service/emailService";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ThemedButton from "../ThemedButtons/ThemedButton";
import LoadingButton from "../ThemedButtons/LoadingButton";
import ChatBoxFeed from "./ChatBoxFeed";

import "./ChatBox.css";
import ChatBoxInput from "./ChatBoxInput";

function ChatBox({
  completedLevels,
  currentLevel,
  emails,
  messages,
  addChatMessage,
  addCompletedLevel,
  resetLevel,
  setEmails,
  incrementNumCompletedLevels,
}: {
  completedLevels: Set<LEVEL_NAMES>;
  currentLevel: LEVEL_NAMES;
  emails: EmailInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  addCompletedLevel: (level: LEVEL_NAMES) => void;
  resetLevel: () => void;
  setEmails: (emails: EmailInfo[]) => void;
  incrementNumCompletedLevels: () => void;
}) {
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // called on mount
  useEffect(() => {
    // get sent emails
    getSentEmails(currentLevel)
      .then((sentEmails) => {
        setEmails(sentEmails);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [setEmails]);

  function getSuccessMessage() {
    return `Congratulations! You have completed this level. Please click on the next level to continue.`;
  }

  async function sendChatMessage() {
    if (chatInput && !isSendingMessage) {
      setIsSendingMessage(true);
      // clear the input box
      setChatInput("");
      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message: chatInput,
        type: CHAT_MESSAGE_TYPE.USER,
      });

      const response: ChatResponse = await sendMessage(chatInput, currentLevel);
      if (response.wonLevel) incrementNumCompletedLevels();
      const transformedMessage = response.transformedMessage;
      const isTransformed = transformedMessage !== chatInput;
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
            currentLevel
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
            currentLevel
          );
        }
      });

      // we have the message reply
      setIsSendingMessage(false);

      // get sent emails
      const sentEmails: EmailInfo[] = await getSentEmails(currentLevel);
      // update emails
      setEmails(sentEmails);

      if (response.wonLevel && !completedLevels.has(currentLevel)) {
        addCompletedLevel(currentLevel);
        const successMessage = getSuccessMessage();
        addChatMessage({
          type: CHAT_MESSAGE_TYPE.LEVEL_INFO,
          message: successMessage,
        });
        // asynchronously add the message to the chat history
        void addMessageToChatHistory(
          successMessage,
          CHAT_MESSAGE_TYPE.LEVEL_INFO,
          currentLevel
        );
      }
    }
  }
  return (
    <div className="chat-box">
      <ChatBoxFeed messages={messages} />
      <div className="footer">
        <div className="messages">
          <ChatBoxInput
            content={chatInput}
            setContent={setChatInput}
            enterPressed={() => void sendChatMessage()}
          />
          <span className="send-button-wrapper">
            <LoadingButton
              onClick={() => void sendChatMessage()}
              isLoading={isSendingMessage}
            >
              Send
            </LoadingButton>
          </span>
        </div>

        <div className="control-buttons">
          <ExportPDFLink
            messages={messages}
            emails={emails}
            currentLevel={currentLevel}
          />
          <ThemedButton onClick={resetLevel}>Reset</ThemedButton>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
