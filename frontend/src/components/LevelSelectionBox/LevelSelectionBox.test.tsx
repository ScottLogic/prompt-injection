import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { LEVELS } from "../../Levels";
import LevelSelectionBox, { LevelSelectionBoxProps } from "./LevelSelectionBox";

const defaultProps: LevelSelectionBoxProps = {
  currentLevel: LEVELS[0].id,
  numCompletedLevels: 0,
  setNewLevel: () => {},
};

function renderComponent(props: LevelSelectionBoxProps = defaultProps) {
  const user = userEvent.setup();
  render(<LevelSelectionBox {...props} />);
  return { user };
}

function isSandbox(name: string) {
  return /Sandbox/i.test(name);
}

describe("LevelSelectionBox component tests", () => {
  test("renders one button per level", () => {
    renderComponent();

    const levelButtons = screen.getAllByRole("button");
    expect(levelButtons).toHaveLength(LEVELS.length);
    LEVELS.forEach(({ name }) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
  });

  test("renders current level selected", () => {
    const currentLevel = LEVELS[1];

    renderComponent({ ...defaultProps, currentLevel: currentLevel.id });

    const selectedButtons = screen
      .getAllByRole("button")
      .filter((button) => button.classList.contains("selected"));
    expect(selectedButtons).toHaveLength(1);
    expect(selectedButtons[0]).toHaveAccessibleName(currentLevel.name);
  });

  test("renders buttons ahead of current level disabled, except sandbox", () => {
    const numCompletedLevels = 1;
    const currentLevel = LEVELS[numCompletedLevels];

    renderComponent({ ...defaultProps, numCompletedLevels });

    LEVELS.forEach(({ id, name }) => {
      const button = screen.getByRole("button", { name });
      if (id <= currentLevel.id || isSandbox(name)) {
        expect(button).toBeEnabled();
      } else {
        expect(button).toBeDisabled();
      }
    });
  });

  test.each(LEVELS)(
    `fires callback on click, unless current level [$name] clicked`,
    async (level) => {
      const currentLevel = LEVELS[0];
      const setNewLevel = vi.fn();
      const { user } = renderComponent({
        currentLevel: LEVELS[0].id,
        numCompletedLevels: 3,
        setNewLevel,
      });

      await user.click(screen.getByRole("button", { name: level.name }));

      if (level === currentLevel) {
        expect(setNewLevel).not.toHaveBeenCalled();
      } else {
        expect(setNewLevel).toHaveBeenCalledOnce();
        expect(setNewLevel).toHaveBeenCalledWith(level.id);
      }
    }
  );
});
