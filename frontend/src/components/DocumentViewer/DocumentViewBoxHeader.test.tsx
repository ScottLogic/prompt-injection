import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import DocumentViewBoxHeader from "./DocumentViewBoxHeader";

describe("DocumentViewBoxHeader component tests", () => {
  const propMethods = {
    onPrevious: () => {},
    onNext: () => {},
  };

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
        onPrevious={() => {
          propMethods.onPrevious();
        }}
        onNext={() => {
          propMethods.onNext();
        }}
      />
    );
  }

  function getPreviousButton() {
    return screen.getByRole("button", { name: "previous document" });
  }

  function getNextButton() {
    return screen.getByRole("button", { name: "next document" });
  }

  function checkButtonAriaDisabled(
    button: "previous" | "next",
    disabled: boolean
  ) {
    const spyOnClick = vi.spyOn(
      propMethods,
      button === "previous" ? "onPrevious" : "onNext"
    );

    const buttonHtml =
      button === "previous" ? getPreviousButton() : getNextButton();

    expect(buttonHtml).toHaveAttribute(
      "aria-disabled",
      disabled ? "true" : "false"
    );
    // buttons should always be enabled for screen readers
    expect(buttonHtml).toBeEnabled();

    buttonHtml.click();
    if (disabled) {
      expect(spyOnClick).not.toHaveBeenCalled();
    } else {
      expect(spyOnClick).toHaveBeenCalled();
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

  test("GIVEN the first document is shown THEN previous button is disabled", () => {
    const numberOfDocuments = 3;
    const documentIndex = 0;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAriaDisabled("previous", true);
    checkButtonAriaDisabled("next", false);
  });

  test("GIVEN the last document is shown THEN next button is disabled", () => {
    const numberOfDocuments = 3;
    const documentIndex = numberOfDocuments - 1;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAriaDisabled("previous", false);
    checkButtonAriaDisabled("next", true);
  });

  test("GIVEN there's only one document THEN both buttons are disabled", () => {
    const numberOfDocuments = 1;
    const documentIndex = 0;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAriaDisabled("previous", true);
    checkButtonAriaDisabled("next", true);
  });

  test("GIVEN a middle document is shown THEN both buttons are not disabled", () => {
    const numberOfDocuments = 3;
    const documentIndex = 1;
    const documentName = "test";

    renderDocumentViewBoxHeader(numberOfDocuments, documentIndex, documentName);
    checkButtonAriaDisabled("previous", false);
    checkButtonAriaDisabled("next", false);
  });
});
