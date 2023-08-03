import React from "react";
import SentEmail from "./SentEmail";
import "./EmailBox.css";
import { EmailInfo } from "../../service/emailService";

function EmailBox({ emails }: { emails: EmailInfo[] }) {
  return (
    <div id="email-box-feed">
      {[...emails].reverse().map((email, index) => {
        return <SentEmail emailDetails={email} key={index} />;
      })}
    </div>
  );
}

export default EmailBox;
