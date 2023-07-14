import "./SentEmail.css";

function SentEmail(props) {
  return (
    <div className="sent-email">
      <div className="sent-email-address">to: {props.address}</div>
      <div className="sent-email-subject">subject: {props.subject}</div>
      <div className="sent-email-divider"></div>
      <div className="sent-email-content">{props.content}</div>
    </div>
  );
}

export default SentEmail;
