/* eslint-disable @typescript-eslint/no-explicit-any */
const mockFromTemplate = jest.fn(() => "");

import { makePromptTemplate } from "../../src/langchain";

// mock PromptTemplate.fromTemplate static method
jest.mock("langchain/prompts", () => {
  return {
    PromptTemplate: {
      fromTemplate: mockFromTemplate,
    },
  };
});

test("GIVEN call makePromptTemplate THEN fromTemplate called", () => {
  makePromptTemplate(
    "configPrePrompt",
    "defaultPrePrompt",
    "mainPrompt",
    "name"
  );
  expect(mockFromTemplate).toBeCalledTimes(1);
  expect(mockFromTemplate).toBeCalledWith("configPrePrompt" + "mainPrompt");
});

afterEach(() => {
  mockFromTemplate.mockRestore();
});
