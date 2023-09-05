import ExportContent from "./ExportContent";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PDFDownloadLink } from "@react-pdf/renderer";

import "./ExportPDFLink.css";
import { PHASE_NAMES } from "../../models/phase";

function ExportPDFLink({
  messages,
  emails,
  currentPhase,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
  currentPhase: PHASE_NAMES;
}) {
  function getFileName() {
    if (currentPhase === PHASE_NAMES.SANDBOX) {
      return "prompt-injection-chat-log-sandbox.pdf";
    } else {
      return `prompt-injection-chat-log-phase-${currentPhase}.pdf`;
    }
  }

  return (
    <div id="export-chat-box">
      <button className="prompt-injection-button">
        <PDFDownloadLink
          document={
            <ExportContent
              messages={messages}
              emails={emails}
              currentPhase={currentPhase}
            />
          }
          fileName={getFileName()}
        >
          {"Export"}
        </PDFDownloadLink>{" "}
      </button>
    </div>
  );
}

export default ExportPDFLink;
