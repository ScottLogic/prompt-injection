import "./EmailBox.css";
import SentEmail from "./SentEmail";
import { EmailInfo } from "../../models/email";
import { useRef } from "react";
import useIsOverflow from "../../hooks/useIsOverflow";

function EmailBox({ emails }: { emails: EmailInfo[] }) {
  const emailBoxContainer = useRef<HTMLInputElement>(null);
  const isOverflow = useIsOverflow(emailBoxContainer);

  return (
    <div
      className="email-box"
      ref={emailBoxContainer}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={isOverflow ? 0 : -1}
    >
      {[...emails].reverse().map((email, index) => {
        return <SentEmail emailDetails={email} key={index} />;
      })}
    </div>
  );
}

export default EmailBox;
