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
import { getLevelPrompt } from "../../service/levelService";
import ExportPDFLink from "../ExportChat/ExportPDFLink";
import ThemedButton from "../ThemedButtons/ThemedButton";
import LoadingButton from "../ThemedButtons/LoadingButton";
import ChatBoxFeed from "./ChatBoxFeed";

import "./ChatBox.css";
import ThemedTextArea from "../ThemedUserInput/ThemedTextArea";

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
  const [textAreaContent, setTextAreaContent] = useState<string>("");
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

  async function getSuccessMessage(level: number) {
    const prompt = await getLevelPrompt(level);
    return `Congratulations! You have completed this level. My original instructions were: 
    
    ${prompt}

    Please click on the next level to continue.`;
  }

  async function sendChatMessage() {
    if (textAreaContent && !isSendingMessage) {
      setIsSendingMessage(true);
      // clear the input box
      setTextAreaContent("");
      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message: textAreaContent,
        type: CHAT_MESSAGE_TYPE.USER,
      });

      const response: ChatResponse = await sendMessage(
        textAreaContent,
        currentLevel
      );
      setNumCompletedLevels(response.numLevelsCompleted);
      const transformedMessage = response.transformedMessage;
      const isTransformed = transformedMessage !== textAreaContent;
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
    <div className="chat-box">
      <ChatBoxFeed messages={messages} />
      <div className="footer">
        <div className="messages">
          <ThemedTextArea
            content={textAreaContent}
            maxHeightRem={10}
            placeHolderText="Type here..."
            enterPressed={() => void sendChatMessage()}
            setContent={(text) => {
              setTextAreaContent(text);
            }}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
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
