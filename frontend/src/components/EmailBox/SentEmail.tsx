import React from "react";
import { OpenAIEmail } from "../../service/emailService";
import "./SentEmail.css";

function SentEmail({
  emailDetails,
  key,
}: {
  emailDetails: OpenAIEmail;
  key: number;
}) {
  return (
    <div key={key} className="sent-email">
      <div className="sent-email-address">to: {emailDetails.address}</div>
      <div className="sent-email-subject">subject: {emailDetails.subject}</div>
      <div className="sent-email-divider"></div>
      <div className="sent-email-content">{emailDetails.content}</div>
    </div>
  );
}

export default SentEmail;
