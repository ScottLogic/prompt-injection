import React from "react";
import SentEmail from "./SentEmail";
import "./EmailBox.css";
import { OpenAIEmail } from "../../service/emailService";

function EmailBox({ emails }: { emails: OpenAIEmail[] }) {
  return (
    <div id="email-box-feed">
      {[...emails].reverse().map((email, index) => {
        return <SentEmail emailDetails={email} key={index} />;
      })}
    </div>
  );
}

export default EmailBox;
