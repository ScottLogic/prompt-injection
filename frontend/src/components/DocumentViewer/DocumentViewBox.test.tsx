import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import DocumentViewBox from "./DocumentViewBox";

describe("DocumentViewBox component tests", () => {
  const props = {
    closeOverlay: () => {},
  };

  vi.mock("@src/service/documentService", () => ({
    getDocumentMetas: vi.fn().mockResolvedValue([]),
  }));

  function renderDocumentViewBox() {
    render(
      <DocumentViewBox
        closeOverlay={() => {
          props.closeOverlay();
        }}
      />
    );
  }

  test("WHEN close button clicked THEN closeOverlay called", () => {
    const spyCloseOverlay = vi.spyOn(props, "closeOverlay");

    renderDocumentViewBox();

    const closeButton = screen.getByRole("button", {
      name: "close document viewer",
    });
    closeButton.click();

    expect(spyCloseOverlay).toHaveBeenCalled();
  });
});
