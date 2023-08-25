import { useEffect, useState } from "react";
import "./ChatBox.css";
import ChatBoxFeed from "./ChatBoxFeed";
import { sendMessage } from "../../service/chatService";
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
    getSentEmails().then((sentEmails) => {
      setEmails(sentEmails);
    });
  }, [setEmails]);

  function inputKeyPressed(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      sendChatMessage();
    }
  }

  async function sendChatMessage() {
    const inputBoxElement = document.getElementById("chat-box-input") as HTMLInputElement;
    // get the message from the input box
    const message = inputBoxElement?.value;
    // clear the input box
    inputBoxElement!.value = "";

    if (message && !isSendingMessage) {
      setIsSendingMessage(true);

      // if input has been edited, add both messages to the list of messages. otherwise add original message only
      addChatMessage({
        message: message,
        type: CHAT_MESSAGE_TYPE.USER,
        isOriginalMessage: true,
      });

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
          })
        }
      });

      // we have the message reply
      setIsSendingMessage(false);

      // get sent emails
      const sentEmails: EmailInfo[] = await getSentEmails();
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
        <div id="chat-box-footer-messages">
          <input 
            id="chat-box-input" 
            className="prompt-injection-input"
            type="text"
            placeholder="Type here..."
            autoFocus
            onKeyUp={inputKeyPressed.bind(this)}
          />
          <button 
            id="chat-box-button-send" 
            className="prompt-injection-button"
            onClick={sendChatMessage}
          >
            Send
          </button>
        </div>
        <div id="chat-box-footer-reset">
          <button 
              id="chat-box-button-reset" 
              className="prompt-injection-button"
              onClick={resetPhase.bind(this)}
            >
            Reset phase
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
