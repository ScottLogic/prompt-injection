import "./SentEmail.css";

function SentEmail(props) {
  return (
    <div class="sent-email">
      <div class="sent-email-address">{props.address}</div>
      <div class="sent-email-subject">{props.subject}</div>
      <div class="sent-email-content">{props.content}</div>
    </div>
  );
}

export default SentEmail;
