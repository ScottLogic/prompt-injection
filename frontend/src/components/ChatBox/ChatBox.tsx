import React, { useEffect, useState } from "react";
import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import { clearChat, sendMessage } from "../../service/chatService";
import { getSentEmails } from "../../service/emailService";
import {
  CHAT_MESSAGE_TYPE,
  ChatMessage,
  ChatResponse,
} from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PHASE_NAMES } from "../../models/phase";

function ChatBox(
  this: any,
  {
    messages,
    currentPhase,
    setNumCompletedPhases,
    setEmails,
    updateTriggeredDefences,
    addChatMessage,
    clearMessages,
  }: {
    messages: ChatMessage[];
    currentPhase: PHASE_NAMES;
    setNumCompletedPhases: (numCompletedPhases: number) => void;
    setEmails: (emails: EmailInfo[]) => void;
    updateTriggeredDefences: (defences: string[]) => void;
    addChatMessage: (message: ChatMessage) => void;
    clearMessages: () => void;
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

  const clearClicked = () => {
    // clear local messages
    clearMessages();
    // clear remote messages
    clearChat(currentPhase);
  };

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
      // update triggered defences
      updateTriggeredDefences(response.defenceInfo.triggeredDefences);

      // we have the message reply
      setIsSendingMessage(false);

      // get sent emails
      const sentEmails: EmailInfo[] = await getSentEmails(currentPhase);
      // update emails
      setEmails(sentEmails);

      if (response.wonPhase) {
        addChatMessage({
          type: CHAT_MESSAGE_TYPE.PHASE_INFO,
          message:
            "Congratulations! You have completed this phase. Please click on the next phase to continue.",
          defenceInfo: response.defenceInfo,
          isOriginalMessage: true,
        });
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
          onClick={clearClicked.bind(this)}
        >
          clear
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
