import { clsx } from "clsx";
import { ThemedButtonProps } from "./ThemedButton";
import "./OverlayButton.css";

function OverlayButton({
  children,
  onClick,
  isDisabled = false,
  isSelected = false,
}: ThemedButtonProps) {
  const buttonClass = clsx("overlay-button", { selected: isSelected });

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  );
}
export default OverlayButton;
