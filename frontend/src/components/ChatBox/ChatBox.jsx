import React, { useEffect, useState } from "react";

import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import {
  clearOpenAiChat,
  openAiSendMessage,
} from "../../service/openaiService";
import { getSentEmails } from "../../service/emailService";

function ChatBox(props) {
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messages, setMessages] = useState([]);

  // called on mount
  useEffect(() => {
    // clear remote messages
    clearOpenAiChat();
    // get sent emails
    getSentEmails().then((sentEmails) => {
      props.setEmails(sentEmails);
    });
  }, []);

  const clearClicked = () => {
    // clear local messages
    setMessages([]);
    // clear remote messages
    clearOpenAiChat();
  };

  const sendChatMessage = async (event) => {
    if (event.key === "Enter" && !isSendingMessage) {
      setIsSendingMessage(true);
      // get the message
      const message = event.target.value;

      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      setMessages((messages) => [
        ...messages,
        { message: message, isUser: true, isOriginalMessage: true },
      ]);
      // clear the input
      event.target.value = "";

      const reply = await openAiSendMessage(message);
      const transformedMessage = reply.transformedMessage;
      const isTransformed = transformedMessage !== message;
      // add the transformed message to the chat box if it is different from the original message
      if (isTransformed) {
        setMessages((messages) => [
          ...messages,
          {
            message: transformedMessage,
            isUser: true,
            isOriginalMessage: false,
          },
        ]);
      }
      // add it to the list of messages
      setMessages((messages) => [
        ...messages,
        { isUser: false, message: reply.reply, defenceInfo: reply.defenceInfo },
      ]);
      // update triggered defences
      props.updateTriggeredDefences(reply.defenceInfo.triggeredDefences);

      // we have the message reply
      setIsSendingMessage(false);

      // get sent emails
      const sentEmails = await getSentEmails();
      // update emails
      props.setEmails(sentEmails);
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
