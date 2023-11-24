import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import DocumentViewBox from "./DocumentViewBox";
import DocumentViewBoxHeader from "./DocumentViewBoxHeader";
import { DocumentViewBoxHeaderProps } from "./DocumentViewBoxHeaderProps";

describe("DocumentViewBox component tests", () => {
  const mockCloseOverlay = vi.fn();

  vi.mock("@src/service/documentService", () => ({
    getDocumentMetas: vi.fn().mockResolvedValue([]),
  }));

  function renderDocumentViewBox() {
    render(<DocumentViewBox closeOverlay={mockCloseOverlay} />);
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

describe("DocumentViewBoxHeader component tests", () => {
  const defaultProps: DocumentViewBoxHeaderProps = {
    numberOfDocuments: 3,
    documentIndex: 0,
    documentName: "test",
    onPrevious: () => {},
    onNext: () => {},
  };

  function renderDocumentViewBoxHeader(props = defaultProps) {
    const user = userEvent.setup();
    render(<DocumentViewBoxHeader {...props} />);
    return { user };
  }

  function getPreviousButton() {
    return screen.getByRole("button", { name: "previous document" });
  }

  function getNextButton() {
    return screen.getByRole("button", { name: "next document" });
  }

  test("document index, name, and number of documents are shown", () => {
    const numberOfDocuments = 3;
    const documentIndex = 0;
    const documentName = "test";

    renderDocumentViewBoxHeader({
      ...defaultProps,
      numberOfDocuments,
      documentIndex,
      documentName,
    });

    const documentNameHtml = screen.getByText(documentName);
    expect(documentNameHtml).toBeInTheDocument();
    const documentIndexHtml = screen.getByText(documentIndex + 1, {
      exact: false,
    });
    expect(documentIndexHtml).toBeInTheDocument();
    const numberOfDocumentsHtml = screen.getByText(numberOfDocuments, {
      exact: false,
    });
    expect(numberOfDocumentsHtml).toBeInTheDocument();
  });

  test("GIVEN the first document is shown THEN previous button is disabled", async () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();
    renderDocumentViewBoxHeader({
      ...defaultProps,
      numberOfDocuments: 3,
      documentIndex: 0,
      onPrevious: mockOnPrevious,
      onNext: mockOnNext,
    });

    const prevButton = getPreviousButton();
    expect(prevButton).toHaveAttribute("aria-disabled", "true");
    expect(prevButton).toBeEnabled();
    await userEvent.click(prevButton);
    expect(mockOnPrevious).not.toHaveBeenCalled();

    const nextButton = getNextButton();
    expect(nextButton).toHaveAttribute("aria-disabled", "false");
    expect(nextButton).toBeEnabled();
    await userEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });

  test("GIVEN the last document is shown THEN next button is disabled", () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();
    renderDocumentViewBoxHeader({
      ...defaultProps,
      numberOfDocuments: 3,
      documentIndex: 2,
      onPrevious: mockOnPrevious,
      onNext: mockOnNext,
    });

    const prevButton = getPreviousButton();
    expect(prevButton).toHaveAttribute("aria-disabled", "false");
    expect(prevButton).toBeEnabled();
    prevButton.click();
    expect(mockOnPrevious).toHaveBeenCalled();

    const nextButton = getNextButton();
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
    expect(nextButton).toBeEnabled();
    nextButton.click();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  test("GIVEN there's only one document THEN both buttons are disabled", () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();
    renderDocumentViewBoxHeader({
      ...defaultProps,
      numberOfDocuments: 1,
      documentIndex: 0,
      onPrevious: mockOnPrevious,
      onNext: mockOnNext,
    });

    const prevButton = getPreviousButton();
    expect(prevButton).toHaveAttribute("aria-disabled", "true");
    expect(prevButton).toBeEnabled();
    prevButton.click();
    expect(mockOnPrevious).not.toHaveBeenCalled();

    const nextButton = getNextButton();
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
    expect(nextButton).toBeEnabled();
    nextButton.click();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  test("GIVEN a middle document is shown THEN both buttons are not disabled", () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();
    renderDocumentViewBoxHeader({
      ...defaultProps,
      numberOfDocuments: 3,
      documentIndex: 1,
      onPrevious: mockOnPrevious,
      onNext: mockOnNext,
    });

    const prevButton = getPreviousButton();
    expect(prevButton).toHaveAttribute("aria-disabled", "false");
    expect(prevButton).toBeEnabled();
    prevButton.click();
    expect(mockOnPrevious).toHaveBeenCalled();

    const nextButton = getNextButton();
    expect(nextButton).toHaveAttribute("aria-disabled", "false");
    expect(nextButton).toBeEnabled();
    nextButton.click();
    expect(mockOnNext).toHaveBeenCalled();
  });
});
