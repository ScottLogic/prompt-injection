import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import ExportChatBox from "./ExportChatBox";
import ExportEmailBox from "./ExportEmailBox";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
  },
  pageContent: {
    flexDirection: "row",
  },
  headerSection: {
    margin: 10,
    padding: 10,
    borderBottom: "1px solid black",
    alignContent: "center",
  },
  subheaderSection: {
    borderBottom: "1px solid black",
    alignContent: "center",
  },
  header: {
    fontSize: 20,
  },
  section: {
    margin: 5,
    padding: 10,
    border: "1px solid black",
    width: "50%",
    flexDirection: "column",
  },
  chatMessage: {
    marginBottom: 5,
    fontSize: 10,
  },
});

const PDFExportContent = ({
  messages,
  emails,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
}) => {
  console.log("Exporting chat history");
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text>Prompt injection demo chat</Text>
        </View>
        <View style={styles.pageContent}>
          <View style={styles.section}>
            <View style={styles.subheaderSection}>
              <Text>chat</Text>
            </View>
            <ExportChatBox items={messages} />
          </View>
          <View style={styles.section}>
            <View style={styles.subheaderSection}>
              <Text>sent emails</Text>
            </View>
            <ExportEmailBox emails={emails} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFExportContent;
