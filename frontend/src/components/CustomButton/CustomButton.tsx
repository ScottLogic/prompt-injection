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
  function getClassName() {
    let className = "custom-button";
    if (isSelected) {
      className += " custom-button-selected";
    }
    return className;
  }

  return (
    <button className={getClassName()} onClick={onClick} disabled={isDisabled}>
      {text}
    </button>
  );
}

export default CustomButton;
