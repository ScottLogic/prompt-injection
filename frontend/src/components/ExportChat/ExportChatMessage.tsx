import React, { Fragment } from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { CHAT_MESSAGE_TYPE, ChatMessage } from "../../models/chat";

const styles = StyleSheet.create({
  chatBoxMessage: {
    borderColor: "#888",
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: 1,
    marginTop: 8,
    padding: 8,
    maxWidth: "85%",
    hyphens: "auto",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
  chatBoxInfo: {
    marginTop: 8,
    padding: 8,
  },
  text: {
    fontSize: 10,
  },
});

const getFullPrefix = (message: ChatMessage) => {
  switch (message.type) {
    case CHAT_MESSAGE_TYPE.INFO:
      return "Info: " + message.message;
    case CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED:
      return "Info: " + message.message;
    case CHAT_MESSAGE_TYPE.USER:
      if (message.isOriginalMessage) {
        return "You: " + message.message;
      } else {
        return "You (edited): " + message.message;
      }
    case CHAT_MESSAGE_TYPE.BOT:
      return "Bot: " + message.message;
    default:
      return message.message;
  }
};

const ExportChatMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <View
      style={
        message.type === CHAT_MESSAGE_TYPE.INFO
          ? styles.chatBoxInfo
          : styles.chatBoxMessage
      }
    >
      <Text style={styles.text}>{getFullPrefix(message)}</Text>
    </View>
  );
};

export default ExportChatMessage;
