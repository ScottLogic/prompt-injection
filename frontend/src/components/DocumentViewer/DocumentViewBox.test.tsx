import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import DocumentViewBox from "./DocumentViewBox";

describe("DocumentViewBox component tests", () => {
  const mockCloseOverlay = vi.fn();

  vi.mock("@src/service/documentService", () => ({
    getDocumentMetas: vi.fn().mockResolvedValue([]),
  }));

  function renderDocumentViewBox() {
    render(
      <DocumentViewBox
        closeOverlay={mockCloseOverlay}
      />
    );
  }

  test("WHEN close button clicked THEN closeOverlay called", () => {
    renderDocumentViewBox();

    const closeButton = screen.getByRole("button", {
      name: "close document viewer",
    });
    closeButton.click();

    expect(mockCloseOverlay).toHaveBeenCalled();
  });
});
