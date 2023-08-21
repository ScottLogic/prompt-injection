import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import ChatBoxFeed from "../ChatBox/ChatBoxFeed";
import EmailBox from "../EmailBox/EmailBox";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "white",
    orientation: "landscape",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
  },
});

const PDFExportContent = ({
  messages,
  emails,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Prompt injection demo chat</Text>
          <View>
            <Text>Chat:</Text>
            <ChatBoxFeed messages={messages} />
          </View>
        </View>
        <View style={styles.section}>
          <Text>Emails:</Text>
          <EmailBox emails={emails} />
        </View>
      </Page>
    </Document>
  );
};

export default PDFExportContent;
