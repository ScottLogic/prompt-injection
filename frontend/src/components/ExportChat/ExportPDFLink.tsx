import { PDFDownloadLink } from "@react-pdf/renderer";
import { ChatMessage } from "@src/models/chat";
import { EmailInfo } from "@src/models/email";
import { LEVEL_NAMES } from "@src/models/level";
import ExportContent from "./ExportContent";

import "./ExportPDFLink.css";

function ExportPDFLink({
  messages,
  emails,
  currentLevel,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
  currentLevel: LEVEL_NAMES;
}) {
  function getFileName() {
    if (currentLevel === LEVEL_NAMES.SANDBOX) {
      return "spy-logic-chat-log-sandbox.pdf";
    } else {
      return `spy-logic-chat-log-level-${currentLevel + 1}.pdf`;
    }
  }

  return (
    <PDFDownloadLink
      document={
        <ExportContent
          messages={messages}
          emails={emails}
          currentLevel={currentLevel}
        />
      }
      className="themed-button export-chat-link"
      fileName={getFileName()}
    >
      Export
    </PDFDownloadLink>
  );
}

export default ExportPDFLink;
