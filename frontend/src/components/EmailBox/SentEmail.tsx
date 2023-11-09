import "./SentEmail.css";
import { EmailInfo } from "../../models/email";

function SentEmail({ emailDetails }: { emailDetails: EmailInfo }) {
  return (
    <div className="sent-email">
      <div>
        <b>To:</b> {emailDetails.address}
      </div>
      <div>
        <b>Subject:</b> {emailDetails.subject}
      </div>
      <hr />
      <div>{emailDetails.body}</div>
    </div>
  );
}

export default SentEmail;
