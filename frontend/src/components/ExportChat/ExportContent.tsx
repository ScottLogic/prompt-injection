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
    marginBottom: 5,
    alignContent: "center",
  },
  header: {
    fontSize: 20,
  },
  section: {
    margin: 5,
    padding: 10,
    width: "50%",
    flexDirection: "column",
  },
  chatMessage: {
    marginBottom: 5,
    fontSize: 10,
  },
});

const ExportContent = ({
  messages,
  emails,
  currentPhase,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
  currentPhase: number;
}) => {
  const getTitle = (currentPhase: number) => {
    const title = "Prompt injection demo chat";
    if (currentPhase === 3) {
      return title + " (sandbox mode)";
    } else {
      return title + " (phase " + currentPhase + ")";
    }
  };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.header}>{getTitle(currentPhase)}</Text>
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

export default ExportContent;
