import React from "react";
import ExportContent from "./ExportContent";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PDFDownloadLink } from "@react-pdf/renderer";

import "./ExportChat.css";

const ExportPDFLink = ({
  messages,
  emails,
  currentPhase,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
  currentPhase: number;
}) => {
  const getFileName = () => {
    if (currentPhase === 3) {
      return "prompt-injection-chat-log-sandbox.pdf";
    }
    return "prompt-injection-chat-log-phase-" + currentPhase + ".pdf";
  };
  return (
    <div id="export-chat-box">
      <PDFDownloadLink
        document={
          <ExportContent
            messages={messages}
            emails={emails}
            currentPhase={currentPhase}
          />
        }
        fileName={getFileName()}
        className="pdf-download-button"
      >
        {"Export chat history"}
      </PDFDownloadLink>
    </div>
  );
};

export default ExportPDFLink;
