import { KeyboardEvent, useEffect, useRef, useState } from "react";
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
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recalledMessageReverseIndex, setRecalledMessageReverseIndex] =
    useState(0);

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
    if (textareaRef.current) {
      const maxHeightPx = 150;
      textareaRef.current.style.height = "0";
      if (textareaRef.current.scrollHeight > maxHeightPx) {
        textareaRef.current.style.height = `${maxHeightPx}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }

  function inputChange() {
    if (textareaRef.current) {
      // scroll to the bottom
      textareaRef.current.scrollTop =
        textareaRef.current.scrollHeight - textareaRef.current.clientHeight;
      // reset the height
      resizeInput();
    }
  }

  function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const ctrlUp = event.ctrlKey && event.key === "ArrowUp";
    const ctrlDown = event.ctrlKey && event.key === "ArrowDown";
    const enterNotShift = event.key === "Enter" && !event.shiftKey;

    if (ctrlUp || ctrlDown || enterNotShift) {
      event.preventDefault();
    }
  }

  function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    // shift+enter shouldn't send message
    if (event.key === "Enter" && !event.shiftKey && !isSendingMessage) {
      // asynchronously send the message
      void sendChatMessage();
    } else if (event.key === "ArrowUp" && event.ctrlKey) {
      recallSentMessageFromHistory("backward");
    } else if (event.key === "ArrowDown" && event.ctrlKey) {
      recallSentMessageFromHistory("forward");
    }
  }

  function recallSentMessageFromHistory(direction: "backward" | "forward") {
    const sentMessages = messages.filter(
      (message) => message.type === CHAT_MESSAGE_TYPE.USER
    );

    const increment = direction === "backward" ? 1 : -1;
    const nextrecalledMessageReverseIndex = incrementWithClamping(
      recalledMessageReverseIndex,
      increment,
      sentMessages.length
    );

    // recall the message from the history. If at current time, clear the chatbox
    const index = sentMessages.length - nextrecalledMessageReverseIndex;
    const recalledMessage =
      nextrecalledMessageReverseIndex === 0
        ? ""
        : sentMessages[index]?.message ?? "";

    setContentsOfChatBox(recalledMessage);
    setRecalledMessageReverseIndex(nextrecalledMessageReverseIndex);
  }

  function incrementWithClamping(
    valueToIncrement: number,
    incrementAmount: number,
    max: number
  ) {
    const min = 0;
    if (
      min <= valueToIncrement + incrementAmount &&
      valueToIncrement + incrementAmount <= max
    ) {
      return valueToIncrement + incrementAmount;
    } else {
      return valueToIncrement;
    }
  }

  function setContentsOfChatBox(newContents: string) {
    if (textareaRef.current) {
      textareaRef.current.value = newContents;
      resizeInput();
    }
  }

  function getSuccessMessage() {
    return `Congratulations! You have completed this level. Please click on the next level to continue.`;
  }

  async function sendChatMessage() {
    // get the message from the input box
    const message = textareaRef.current?.value;

    if (message) {
      setIsSendingMessage(true);
      // clear the input box
      textareaRef.current.value = "";
      // reset the height
      resizeInput();
      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message,
        type: CHAT_MESSAGE_TYPE.USER,
      });

      const response: ChatResponse = await sendMessage(message, currentLevel);
      if (response.wonLevel) incrementNumCompletedLevels();
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
    setRecalledMessageReverseIndex(0);
  }

  return (
    <div className="chat-box">
      <ChatBoxFeed messages={messages} />
      <div className="footer">
        <div className="messages">
          <textarea
            ref={textareaRef}
            className="chat-box-input"
            placeholder="Type here..."
            rows={1}
            onChange={inputChange}
            onKeyDown={inputKeyDown}
            onKeyUp={inputKeyUp}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
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
