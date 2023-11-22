import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import DocumentViewBoxHeader from "./DocumentViewBoxHeader";

describe("DocumentViewBoxHeader component tests", () => {
  let previousClicked = false;
  let nextClicked = false;

  beforeEach(() => {
    previousClicked = false;
    nextClicked = false;
  });

  function onPrevious() {
    previousClicked = true;
  }
  function onNext() {
    nextClicked = true;
  }

  function renderDocumentViewBoxHeader(
    numberOfDocuments: number,
    documentIndex: number,
    documentName: string
  ) {
    render(
      <DocumentViewBoxHeader
        documentIndex={documentIndex}
        documentName={documentName}
        numberOfDocuments={numberOfDocuments}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    );
  }

  function getPreviousButton() {
    return screen.getByRole("button", { name: "◄ previous document" });
  }

  function getNextButton() {
    return screen.getByRole("button", { name: "next document ►" });
  }

  function checkButtonAria(button: "previous" | "next", disabled: boolean) {
    const buttonHtml =
      button === "previous" ? getPreviousButton() : getNextButton();

    expect(buttonHtml).toHaveAttribute(
      "aria-disabled",
      disabled ? "true" : "false"
    );
    // buttons should always be enabled for screen readers
    expect(buttonHtml).toBeEnabled();

    buttonHtml.click();
    if (button === "previous") {
      expect(previousClicked).toBe(!disabled);
    } else {
      expect(nextClicked).toBe(!disabled);
    }
  }

  test("document index, name, and number of documents are shown", () => {
    const numberOfDocuments = 3;
    const documentIndex = 0;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);

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

  test("previous button aria-disabled when showing the first document", () => {
    const numberOfDocuments = 3;
    const documentIndex = 0;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAria("previous", true);
    checkButtonAria("next", false);
  });

  test("next button aria-disabled when showing the last document", () => {
    const numberOfDocuments = 3;
    const documentIndex = numberOfDocuments - 1;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAria("previous", false);
    checkButtonAria("next", true);
  });

  test("both buttons are aria-disabled when there is only one document", () => {
    const numberOfDocuments = 1;
    const documentIndex = 0;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAria("previous", true);
    checkButtonAria("next", true);
  });

  test("neither button is aria-disabled when in the middle of the documents", () => {
    const numberOfDocuments = 3;
    const documentIndex = 1;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAria("previous", false);
    checkButtonAria("next", false);
  });
});
