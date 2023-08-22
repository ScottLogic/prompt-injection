import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import PDFExportContent from "./PDFExportContent";
import ChatBoxFeed from "../ChatBox/ChatBoxFeed";
import EmailBox from "../EmailBox/EmailBox";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PDFDownloadLink } from "@react-pdf/renderer";

import "./ExportChat.css";

const ExportPDF = ({
  messages,
  emails,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
}) => {
  return (
    <div id="export-chat-box">
      <PDFDownloadLink
        document={<PDFExportContent messages={messages} emails={emails} />}
        fileName="chat-log.pdf"
        className="pdf-download-button"
      >
        {({ loading }) => "Export chat history"}
      </PDFDownloadLink>
    </div>
  );
};

export default ExportPDF;
