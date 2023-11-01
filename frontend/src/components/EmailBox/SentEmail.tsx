import "./SentEmail.css";
import { EmailInfo } from "../../models/email";

function SentEmail({ emailDetails }: { emailDetails: EmailInfo }) {
  return (
    <div className="sent-email">
      <div className="sent-email-address">
        <b>To:</b> {emailDetails.address}
      </div>
      <div className="sent-email-subject">
        <b>Subject:</b> {emailDetails.subject}
      </div>
      <hr />
      <div className="sent-email-content">{emailDetails.content}</div>
    </div>
  );
}

export default SentEmail;
