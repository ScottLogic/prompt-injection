import SentEmail from "./SentEmail";
import "./EmailBox.css";

function EmailBox(props) {
  return (
    <div id="email-box">
      <div id="email-box-header">sent emails</div>
      <div id="email-box-feed">
        {props.emails.toReversed().map((email, index) => {
          return (
            <SentEmail
              address={email.address}
              subject={email.subject}
              content={email.content}
              key={index}
            />
          );
        })}
      </div>
    </div>
  );
}

export default EmailBox;
