import { clsx } from "clsx";

import "./OverlayButton.css";
import { ThemedButtonProps } from "./ThemedButton";

function OverlayButton({
  children,
  onClick,
  disabled = false,
  selected = false,
}: ThemedButtonProps) {
  const buttonClass = clsx("overlay-button", { selected });

  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
export default OverlayButton;
