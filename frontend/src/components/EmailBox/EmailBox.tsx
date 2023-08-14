import "./EmailBox.css";
import SentEmail from "./SentEmail";
import { EmailInfo } from "../../models/email";

function EmailBox({ emails }: { emails: EmailInfo[] }) {
  return (
    <span>
      <div className="side-bar-header">sent emails</div>
      <div id="email-box-feed">
        {[...emails].reverse().map((email, index) => {
          return <SentEmail emailDetails={email} key={index} />;
        })}
      </div>
    </span>
  );
}

export default EmailBox;
