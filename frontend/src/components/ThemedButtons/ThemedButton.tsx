import * as classNames from "classnames";
import { ReactNode } from "react";
import "./ThemedButton.css";

export type ThemedButtonProps = {
  children: ReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  onClick: () => void;
};

function ThemedButton({
  children,
  onClick,
  isDisabled = false,
  isSelected = false,
}: ThemedButtonProps) {
  const buttonClass = classNames("themed-button", { "selected": isSelected });

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  );
}

export default ThemedButton;
