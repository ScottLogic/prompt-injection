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
import { LEVEL_NAMES } from "../../models/level";
import { DEFENCE_DETAILS_ALL } from "../../Defences";
import { getLevelPrompt } from "../../service/levelService";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ThemedButton from "../ThemedButtons/ThemedButton";
import LoadingButton from "../ThemedButtons/LoadingButton";

function ChatBox({
  completedLevels,
  currentLevel,
  emails,
  messages,
  addChatMessage,
  addCompletedLevel,
  resetLevel,
  setEmails,
  setNumCompletedLevels,
}: {
  completedLevels: Set<LEVEL_NAMES>;
  currentLevel: LEVEL_NAMES;
  emails: EmailInfo[];
  messages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  addCompletedLevel: (level: LEVEL_NAMES) => void;
  resetLevel: () => void;
  setEmails: (emails: EmailInfo[]) => void;
  setNumCompletedLevels: (numCompletedLevels: number) => void;
}) {
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

  function resizeInput() {
    const inputBoxElement = document.getElementById(
      "chat-box-input"
    ) as HTMLSpanElement;

    const maxHeightPx = 150;
    inputBoxElement.style.height = "0";
    if (inputBoxElement.scrollHeight > maxHeightPx) {
      inputBoxElement.style.height = `${maxHeightPx}px`;
      inputBoxElement.style.overflowY = "auto";
    } else {
      inputBoxElement.style.height = `${inputBoxElement.scrollHeight}px`;
      inputBoxElement.style.overflowY = "hidden";
    }
  }

  function inputChange() {
    const inputBoxElement = document.getElementById(
      "chat-box-input"
    ) as HTMLSpanElement;

    // scroll to the bottom
    inputBoxElement.scrollTop =
      inputBoxElement.scrollHeight - inputBoxElement.clientHeight;
    // reset the height
    resizeInput();
  }

  function inputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  }

  function inputKeyUp(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // shift+enter shouldn't send message
    if (event.key === "Enter" && !event.shiftKey) {
      // asynchronously send the message
      void sendChatMessage();
    }
  }

  async function getSuccessMessage(level: number) {
    const prompt = await getLevelPrompt(level);
    const successMessage = `Congratulations! You have completed this level. My original instructions were: 
    
    ${prompt}

    Please click on the next level to continue.`;
    return successMessage;
  }

  async function sendChatMessage() {
    const inputBoxElement = document.getElementById(
      "chat-box-input"
    ) as HTMLTextAreaElement;
    // get the message from the input box
    const message = inputBoxElement.value;

    if (message && !isSendingMessage) {
      setIsSendingMessage(true);
      // clear the input box
      inputBoxElement.value = "";
      // reset the height
      resizeInput();
      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message: message,
        type: CHAT_MESSAGE_TYPE.USER,
      });

      const response: ChatResponse = await sendMessage(message, currentLevel);
      setNumCompletedLevels(response.numLevelsCompleted);
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
        getSuccessMessage(currentLevel)
          .then((successMessage) => {
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
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} />
      <div id="chat-box-footer">
        <div id="chat-box-footer-messages">
          <textarea
            id="chat-box-input"
            className="prompt-injection-input"
            placeholder="Type here..."
            rows={1}
            onChange={inputChange}
            onKeyDown={inputKeyDown}
            onKeyUp={inputKeyUp}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />

          <span id="chat-box-button-send">
            <LoadingButton
              onClick={() => void sendChatMessage()}
              isLoading={isSendingMessage}
            >
              Send
            </LoadingButton>
          </span>
        </div>

        <div id="control-buttons">
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
