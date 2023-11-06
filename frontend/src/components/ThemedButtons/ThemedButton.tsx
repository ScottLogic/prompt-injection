import { clsx } from "clsx";
import { ReactNode } from "react";
import "./ThemedButton.css";

export interface ThemedButtonProps {
  children: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  title?: string;
  onClick: () => void;
  appearsDifferentWhenDisabled?: boolean;
}

function ThemedButton({
  children,
  onClick,
  disabled = false,
  selected = false,
  title = "",
  appearsDifferentWhenDisabled = true,
}: ThemedButtonProps) {
  const buttonClass = clsx("themed-button", {
    selected,
    appearsDifferentWhenDisabled,
  });

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export default ThemedButton;
