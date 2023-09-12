import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import ExportChatBox from "./ExportChatBox";
import ExportEmailBox from "./ExportEmailBox";
import { PHASE_NAMES } from "../../models/phase";

import CombinedFonts from "../../assets/fonts/CombinedFonts.ttf";
import NotoSerifJP from "../../assets/fonts/NotoSerifJP-Regular.otf";
import NotoSansSC from "../../assets/fonts/NotoSansSC-Regular.ttf";

Font.register({ family: "CombinedFonts", src: CombinedFonts });

// chinese and japanese - currently multi lang not supported
Font.register({ family: "NotoSerifJP", src: NotoSerifJP });
Font.register({ family: "NotoSansSC", src: NotoSansSC });

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    fontFamily: "CombinedFonts",
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

function ExportContent({
  messages,
  emails,
  currentPhase,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
  currentPhase: PHASE_NAMES;
}) {
  function getTitle(currentPhase: PHASE_NAMES) {
    const title = "Prompt injection demo chat";
    if (currentPhase === PHASE_NAMES.SANDBOX) {
      return `${title} (sandbox mode)`;
    } else {
      return `${title} (phase ${currentPhase})`;
    }
  }

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
}

export default ExportContent;
