import "./EmailBox.css";
import SentEmail from "./SentEmail";
import { EmailInfo } from "../../models/email";

function EmailBox({ emails }: { emails: EmailInfo[] }) {
  return (
    <div className="email-box">
      <div className="email-box-feed">
        {[...emails].reverse().map((email, index) => {
          return <SentEmail emailDetails={email} key={index} />;
        })}
      </div>
    </div>
  );
}

export default EmailBox;
