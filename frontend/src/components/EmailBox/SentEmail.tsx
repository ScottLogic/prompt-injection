import "./SentEmail.css";
import { EmailInfo } from "../../models/email";

function SentEmail({ emailDetails }: { emailDetails: EmailInfo }) {
  return (
    <div className="sent-email">
      <div className="sent-email-address">to: {emailDetails.address}</div>
      <div className="sent-email-subject">subject: {emailDetails.subject}</div>
      <div className="sent-email-divider"></div>
      <div className="sent-email-content">{emailDetails.content}</div>
    </div>
  );
}

export default SentEmail;
