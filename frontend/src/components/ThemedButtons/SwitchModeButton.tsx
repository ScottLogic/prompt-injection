import ThemedButton, { ThemedButtonProps } from "./ThemedButton";
import { LEVEL_NAMES } from "../../models/level";

function SwitchModeButton({
  currentLevel,
  ...buttonProps
}: ThemedButtonProps & {
  currentLevel?: LEVEL_NAMES;
}) {
  return (
    <ThemedButton {...buttonProps}>
      {currentLevel === LEVEL_NAMES.SANDBOX
        ? "Sandbox mode. Click here to select story mode."
        : "Story mode. Click here to select sandbox mode."}
    </ThemedButton>
  );
}

export default SwitchModeButton;
