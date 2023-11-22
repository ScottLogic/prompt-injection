import { LEVEL_NAMES, LevelSystemRole } from "@src/models/level";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import HandbookSystemRole from "./HandbookSystemRole";

describe("HandbookSystemRole component tests", () => {
  const level1SystemRole = "System Role for level 1";
  const level2SystemRole = "System Role for level 2";
  const level3SystemRole = "System Role for level 3";

  const systemRoles: LevelSystemRole[] = [
    { level: LEVEL_NAMES.LEVEL_1, systemRole: level1SystemRole },
    { level: LEVEL_NAMES.LEVEL_2, systemRole: level2SystemRole },
    { level: LEVEL_NAMES.LEVEL_3, systemRole: level3SystemRole },
  ];

  test("renders no system roles and instead renders locked boxes when no levels complete", () => {
    const numLevelsCompleted = 0;

    const { container } = render(
      <HandbookSystemRole
        numCompletedLevels={numLevelsCompleted}
        systemRoles={systemRoles}
      />
    );

    expect(screen.getByText("System Roles")).toBeInTheDocument();

    // make sure no system roles are displayed on the page
    expect(screen.queryAllByText(level1SystemRole)).toHaveLength(0);
    expect(screen.queryAllByText(level2SystemRole)).toHaveLength(0);
    expect(screen.queryAllByText(level3SystemRole)).toHaveLength(0);

    // make sure all system roles are locked
    const lockedBox = container.getElementsByClassName("role-locked");
    expect(lockedBox).toHaveLength(systemRoles.length);
  });

  test("renders level 1 system role only and keeps level 2 and 3 system roles locked boxes when 1 levels complete", () => {
    const numLevelsCompleted = 1;

    const { container } = render(
      <HandbookSystemRole
        numCompletedLevels={numLevelsCompleted}
        systemRoles={systemRoles}
      />
    );

    expect(screen.getByText("System Roles")).toBeInTheDocument();

    // check level 1 is shown but level 2 and 3 are not
    expect(screen.queryAllByText(level1SystemRole)).toHaveLength(1);
    expect(screen.queryAllByText(level2SystemRole)).toHaveLength(0);
    expect(screen.queryAllByText(level3SystemRole)).toHaveLength(0);

    // make sure 2 system roles are locked
    const lockedBox = container.getElementsByClassName("role-locked");
    expect(lockedBox).toHaveLength(2);
  });

  test("renders level 1 & 2 system roles and keeps level 3 system roles locked boxe when 2 levels complete", () => {
    const numLevelsCompleted = 2;

    const { container } = render(
      <HandbookSystemRole
        numCompletedLevels={numLevelsCompleted}
        systemRoles={systemRoles}
      />
    );

    expect(screen.getByText("System Roles")).toBeInTheDocument();

    // check level 1 and 3 are shown and 3 is not
    expect(screen.queryAllByText(level1SystemRole)).toHaveLength(1);
    expect(screen.queryAllByText(level2SystemRole)).toHaveLength(1);
    expect(screen.queryAllByText(level3SystemRole)).toHaveLength(0);

    // make sure 1 system role  locked
    const lockedBox = container.getElementsByClassName("role-locked");
    expect(lockedBox).toHaveLength(1);
  });

  test("renders all system roles when 3 levels complete", () => {
    const numLevelsCompleted = 3;

    const { container } = render(
      <HandbookSystemRole
        numCompletedLevels={numLevelsCompleted}
        systemRoles={systemRoles}
      />
    );

    expect(screen.getByText("System Roles")).toBeInTheDocument();

    // check all levels system roles are shown
    expect(screen.queryAllByText(level1SystemRole)).toHaveLength(1);
    expect(screen.queryAllByText(level2SystemRole)).toHaveLength(1);
    expect(screen.queryAllByText(level3SystemRole)).toHaveLength(1);

    // check no locked boxes
    const lockedBox = container.getElementsByClassName("role-locked");
    expect(lockedBox).toHaveLength(0);
  });
});
