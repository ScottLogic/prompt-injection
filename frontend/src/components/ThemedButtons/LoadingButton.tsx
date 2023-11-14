import { ThreeDots } from "react-loader-spinner";

import ThemedButton, { ThemedButtonProps } from "./ThemedButton";

import "./Loader.css";

function LoadingButton({
  children,
  isLoading = false,
  ...buttonProps
}: ThemedButtonProps & {
  isLoading?: boolean;
}) {
  return (
    <ThemedButton
      disabled={isLoading}
      appearsDifferentWhenDisabled={false}
      {...buttonProps}
    >
      {children}
      {isLoading && (
        <ThreeDots width="1.5rem" color="white" wrapperClass="loader" />
      )}
    </ThemedButton>
  );
}

export default LoadingButton;
