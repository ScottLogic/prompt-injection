import ExportContent from "./ExportContent";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PDFDownloadLink } from "@react-pdf/renderer";

import "./ExportPDFLink.css";
import { LEVEL_NAMES } from "../../models/level";

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
      return `spy-logic-chat-log-level-${currentLevel}.pdf`;
    }
  }

  return (
    <div id="export-chat-box">
      <PDFDownloadLink
        document={
          <ExportContent
            messages={messages}
            emails={emails}
            currentLevel={currentLevel}
          />
        }
        fileName={getFileName()}
      >
        <button className="prompt-injection-button">Export</button>
      </PDFDownloadLink>{" "}
    </div>
  );
}

export default ExportPDFLink;
