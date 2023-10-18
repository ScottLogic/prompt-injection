import { ThreeDots } from "react-loader-spinner";
import ThemedButton, { ThemedButtonProps } from "./ThemedButton";

function LoadingButton({
  children,
  isLoading = false,
  ...buttonProps
}: ThemedButtonProps & {
  isLoading?: boolean;
}) {
  return (
    <ThemedButton
      isDisabled={isLoading}
      appearsDifferentWhenDisabled={false}
      {...buttonProps}>
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
