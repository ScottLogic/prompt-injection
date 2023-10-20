import { render, screen, fireEvent } from "@testing-library/react";
import { LEVELS } from "../../Levels";
import { describe, expect, test, vi } from "vitest";
import { LEVEL_NAMES } from "../../models/level";
import ShortMissionInfoButton from "./ShortMIssionInfoButton";

describe("ShortMissionInfoButton component tests", () => {
  test("renders the button with the current levels mission info", () => {
    const currentLevel = LEVEL_NAMES.LEVEL_1;
    render(
      <ShortMissionInfoButton
        currentLevel={currentLevel}
        openOverlay={() => {}}
      />
    );

    const button = screen.getByRole("button");
    const expectedContent = LEVELS[currentLevel].missionInfoShort ?? "";
    expect(button).toHaveTextContent(expectedContent);
  });

  test("fires the openOverlay callback on button click", () => {
    const currentLevel = LEVEL_NAMES.LEVEL_1;

    const openOverlayMock = vi.fn();
    render(
      <ShortMissionInfoButton
        currentLevel={currentLevel}
        openOverlay={openOverlayMock}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(openOverlayMock).toHaveBeenCalled();
  });
});
