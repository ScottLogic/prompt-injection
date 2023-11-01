import { clsx } from "clsx";
import { ReactNode } from "react";
import "./ThemedButton.css";

export interface ThemedButtonProps {
  children: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  onClick: () => void;
  appearsDifferentWhenDisabled?: boolean;
}

function ThemedButton({
  children,
  onClick,
  disabled = false,
  selected = false,
  appearsDifferentWhenDisabled = true,
}: ThemedButtonProps) {
  const buttonClass = clsx("themed-button", {
    selected,
    appearsDifferentWhenDisabled,
  });

  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default ThemedButton;
