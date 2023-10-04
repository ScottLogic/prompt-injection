import { ThreeDots } from "react-loader-spinner";
import ThemedButton from "./ThemedButton";

function LoadingButton({
  children,
  onClick,
  isDisabled = false,
  isLoading = false,
  isSelected = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isSelected?: boolean;
}) {
  return (
    <ThemedButton
      onClick={onClick}
      isDisabled={isDisabled}
      isSelected={isSelected}
    >
      {isLoading ? (
        <span className="loader">
          <ThreeDots width="24px" color="white" />
        </span>
      ) : (
        children
      )}
    </ThemedButton>
  );
}

export default LoadingButton;
