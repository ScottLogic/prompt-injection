import "./EmailBox.css";

import { useRef } from "react";

import SentEmail from "./SentEmail";

import useIsOverflow from "@src/hooks/useIsOverflow";
import { EmailInfo } from "@src/models/email";

function EmailBox({ emails }: { emails: EmailInfo[] }) {
  const emailBoxContainer = useRef<HTMLDivElement>(null);
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
