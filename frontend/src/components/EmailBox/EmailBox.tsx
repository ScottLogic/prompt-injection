import "./EmailBox.css";
import SentEmail from "./SentEmail";
import { EmailInfo } from "../../models/email";

function EmailBox({ emails }: { emails: EmailInfo[] }) {
  return (
    <div className="email-box">
      {[...emails].reverse().map((email, index) => {
        return <SentEmail emailDetails={email} key={index} />;
      })}
    </div>
  );
}

export default EmailBox;
