import { clsx } from "clsx";
import { ReactNode } from "react";
import "./ThemedButton.css";

export interface ThemedButtonProps {
  children: ReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

function ThemedButton({
  children,
  onClick,
  isDisabled = false,
  isSelected = false,
}: ThemedButtonProps) {
  const buttonClass = clsx("themed-button", { selected: isSelected });

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  );
}

export default ThemedButton;
