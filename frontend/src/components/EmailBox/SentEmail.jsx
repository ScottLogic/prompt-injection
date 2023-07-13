import "./SentEmail.css";

function SentEmail(props) {
  return (
    <div class="sent-email">
      <div class="sent-email-address">to: {props.address}</div>
      <div class="sent-email-subject">subject: {props.subject}</div>
      <div class="sent-email-divider"></div>
      <div class="sent-email-content">{props.content}</div>
    </div>
  );
}

export default SentEmail;
