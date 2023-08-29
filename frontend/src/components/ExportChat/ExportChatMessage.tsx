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
    float: "left",
    textAlign: "left",
  },
  chatBoxMessageBot: {
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
    float: "right",
    marginLeft: "auto",
    textAlign: "right",
  },
  chatBoxInfo: {
    marginTop: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
  },
});

const getMessage = (message: ChatMessage) => {
  if (
    message.type === CHAT_MESSAGE_TYPE.BOT &&
    message.defenceInfo?.isBlocked
  ) {
    // show the reason why the message was blocked
    return message.defenceInfo.blockedReason;
  } else {
    return message.message;
  }
};

const getFullPrefix = (message: ChatMessage) => {
  switch (message.type) {
    case CHAT_MESSAGE_TYPE.INFO:
    case CHAT_MESSAGE_TYPE.DEFENCE_ALERTED:
    case CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED:
      return "Info: " + getMessage(message);
    case CHAT_MESSAGE_TYPE.USER:
      if (message.isOriginalMessage) {
        return "You: " + getMessage(message);
      } else {
        return "You (edited): " + getMessage(message);
      }
    case CHAT_MESSAGE_TYPE.BOT:
      return "Bot: " + getMessage(message);
    default:
      return getMessage(message);
  }
};

const getMessageStyle = (type: CHAT_MESSAGE_TYPE) => {
  switch (type) {
    case CHAT_MESSAGE_TYPE.INFO:
    case CHAT_MESSAGE_TYPE.DEFENCE_ALERTED:
    case CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED:
      return styles.chatBoxInfo;
    case CHAT_MESSAGE_TYPE.USER:
      return styles.chatBoxMessage;
    case CHAT_MESSAGE_TYPE.BOT:
      return styles.chatBoxMessageBot;
    case CHAT_MESSAGE_TYPE.PHASE_INFO:
      return styles.chatBoxMessageBot;
    default:
      return styles.chatBoxMessage;
  }
};

const ExportChatMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <View style={getMessageStyle(message.type)}>
      <Text style={styles.text}>{getFullPrefix(message)}</Text>
    </View>
  );
};

export default ExportChatMessage;
