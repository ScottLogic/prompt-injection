import * as classNames from "classnames";
import "./CustomButton.css";

function CustomButton({
  text,
  onClick,
  isDisabled = false,
  isSelected = false,
}: {
  text: string;
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
      {text}
    </button>
  );
}

export default CustomButton;
