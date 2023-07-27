import React, { useEffect, useState } from "react";
import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import {
  OpenAIMessage,
  OpenAIResponse,
  clearOpenAiChat,
  openAiSendMessage,
} from "../../service/openaiService";
import { OpenAIEmail, getSentEmails } from "../../service/emailService";

function ChatBox(
  this: any,
  {
    setEmails,
    updateTriggeredDefences,
  }: {
    setEmails: (emails: any) => void;
    updateTriggeredDefences: (defences: string[]) => void;
  }
) {
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [messages, setMessages] = useState<OpenAIMessage[]>([]);

  // called on mount
  useEffect(() => {
    // clear remote messages
    clearOpenAiChat();
    // get sent emails
    getSentEmails().then((sentEmails) => {
      setEmails(sentEmails);
    });
  }, [setEmails]);

  const clearClicked = () => {
    // clear local messages
    setMessages([]);
    // clear remote messages
    clearOpenAiChat();
  };

  const sendChatMessage = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && event.target !== null && !isSendingMessage) {
      setIsSendingMessage(true);
      // get the message
      const message = event.currentTarget.value;

      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      setMessages((messages: OpenAIMessage[]) => [
        ...messages,
        { message: message, isUser: true, isOriginalMessage: true },
      ]);
      // clear the input
      event.currentTarget.value = "";

      const response: OpenAIResponse = await openAiSendMessage(message);
      const transformedMessage = response.transformedMessage;
      const isTransformed = transformedMessage !== message;
      // add the transformed message to the chat box if it is different from the original message
      if (isTransformed) {
        setMessages((messages: OpenAIMessage[]) => [
          ...messages,
          {
            message: transformedMessage,
            isUser: true,
            isOriginalMessage: false,
          },
        ]);
      }
      // add it to the list of messages
      setMessages((messages: OpenAIMessage[]) => [
        ...messages,
        {
          isUser: false,
          message: response.reply,
          defenceInfo: response.defenceInfo,
          isOriginalMessage: true,
        },
      ]);
      // update triggered defences
      updateTriggeredDefences(response.defenceInfo.triggeredDefences);

      // we have the message reply
      setIsSendingMessage(false);

      // get sent emails
      const sentEmails: OpenAIEmail[] = await getSentEmails();
      // update emails
      setEmails(sentEmails);
    }
  };

  return (
    <div id="chat-box">
      <ChatBoxFeed messages={messages} />
      <div id="chat-box-footer">
        <div id="chat-box-input">
          <input
            type="text"
            placeholder="chat to chatgpt..."
            autoFocus
            onKeyUp={sendChatMessage.bind(this)}
          />
        </div>
        <div id="chat-box-button" onClick={clearClicked.bind(this)}>
          <button>clear</button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
