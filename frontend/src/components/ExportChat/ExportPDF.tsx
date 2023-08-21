import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import PDFExportContent from "./PDFExportContent";
import ChatBoxFeed from "../ChatBox/ChatBoxFeed";
import EmailBox from "../EmailBox/EmailBox";
import { ChatMessage } from "../../models/chat";
import { EmailInfo } from "../../models/email";
import { PDFDownloadLink } from "@react-pdf/renderer";

const ExportPDF = ({
  messages,
  emails,
}: {
  messages: ChatMessage[];
  emails: EmailInfo[];
}) => {
  return (
    <div id="pdf-download-link">
      <PDFDownloadLink
        document={<PDFExportContent messages={messages} emails={emails} />}
        fileName="chat-log.pdf"
      >
        {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
      </PDFDownloadLink>

      {/* <PDFViewer width="500" height="400">
        <PDFExportContent messages={messages} emails={emails} />
      </PDFViewer> */}
    </div>
  );
};

export default ExportPDF;
