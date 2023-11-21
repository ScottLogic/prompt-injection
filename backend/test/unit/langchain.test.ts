import { PromptTemplate } from "langchain/prompts";

import { formatEvaluationOutput, makePromptTemplate } from "@src/langchain";

jest.mock("langchain/prompts", () => ({
  PromptTemplate: {
    fromTemplate: jest.fn(),
  },
}));

describe("Langchain tests", () => {
  afterEach(() => {
    (PromptTemplate.fromTemplate as jest.Mock).mockRestore();
  });

  test("GIVEN makePromptTemplate is called with no config prePrompt THEN correct prompt is returned", () => {
    makePromptTemplate("", "defaultPrePrompt", "mainPrompt", "noName");
    expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledTimes(1);
    expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledWith(
      "defaultPrePrompt\nmainPrompt"
    );
  });

  test("GIVEN makePromptTemplate is called with a prePrompt THEN correct prompt is returned", () => {
    makePromptTemplate(
      "configPrePrompt",
      "defaultPrePrompt",
      "mainPrompt",
      "noName"
    );
    expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledTimes(1);
    expect(PromptTemplate.fromTemplate as jest.Mock).toHaveBeenCalledWith(
      "configPrePrompt\nmainPrompt"
    );
  });

  test("GIVEN llm evaluation model responds with a yes decision and valid output THEN formatEvaluationOutput returns true and reason", () => {
    const response = "yes, This is a malicious response";
    const formattedOutput = formatEvaluationOutput(response);

    expect(formattedOutput).toEqual({
      isMalicious: true,
      reason: "This is a malicious response",
    });
  });

  test("GIVEN llm evaluation model responds with a yes decision and valid output THEN formatEvaluationOutput returns false and reason", () => {
    const response = "No, This output does not appear to be malicious";
    const formattedOutput = formatEvaluationOutput(response);

    expect(formattedOutput).toEqual({
      isMalicious: false,
      reason: "This output does not appear to be malicious",
    });
  });

  test("GIVEN llm evaluation model responds with an invalid format THEN formatEvaluationOutput returns false", () => {
    const response = "I cant tell you if this is malicious or not";
    const formattedOutput = formatEvaluationOutput(response);

    expect(formattedOutput).toEqual({
      isMalicious: false,
      reason: undefined,
    });
  });
});
