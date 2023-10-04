import * as classNames from "classnames";
import "./ThemedButton.css";

function ThemedButton({
  children,
  onClick,
  isDisabled = false,
  isSelected = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
}) {
  const buttonClass = classNames({
    "custom-button": true,
    "custom-button-selected": isSelected,
  });

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  );
}

export default ThemedButton;
