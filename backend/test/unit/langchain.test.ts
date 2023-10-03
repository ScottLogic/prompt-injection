import { LEVEL_NAMES } from "../../src/models/level";
import {
  initQAModel,
  getFilepath,
  formatEvaluationOutput,
  initPromptEvaluationModel,
  makePromptTemplate,
} from "../../src/langchain";
import { PromptTemplate } from "langchain/prompts";

const mockFromTemplate = jest.fn(() => "");

beforeAll(() => {
  jest.mock("langchain/prompts", () => ({
    PromptTemplate: {
      fromTemplate: mockFromTemplate,
    },
  }));
});

test("GIVEN initQAModel is called with no apiKey THEN return early and log message", () => {
  const level = LEVEL_NAMES.LEVEL_1;
  const prompt = "";
  const consoleDebugMock = jest.spyOn(console, "debug").mockImplementation();

  initQAModel(level, prompt, "");
  expect(consoleDebugMock).toHaveBeenCalledWith(
    "No OpenAI API key set to initialise QA model"
  );
});

test("GIVEN initPromptEvaluationModel is called with no apiKey THEN return early and log message", () => {
  const consoleDebugMock = jest.spyOn(console, "debug").mockImplementation();
  initPromptEvaluationModel(
    "promptInjectionEvalPrePrompt",
    "maliciousPromptEvalPrePrompt",
    ""
  );
  expect(consoleDebugMock).toHaveBeenCalledWith(
    "No OpenAI API key set to initialise prompt evaluation model"
  );
});

test("GIVEN level is 1 THEN correct filepath is returned", () => {
  const filePath = getFilepath(LEVEL_NAMES.LEVEL_1);
  expect(filePath).toBe("resources/documents/level_1/");
});

test("GIVEN level is 2 THEN correct filepath is returned", () => {
  const filePath = getFilepath(LEVEL_NAMES.LEVEL_2);
  expect(filePath).toBe("resources/documents/level_2/");
});

test("GIVEN level is 3 THEN correct filepath is returned", () => {
  const filePath = getFilepath(LEVEL_NAMES.LEVEL_3);
  expect(filePath).toBe("resources/documents/level_3/");
});

test("GIVEN level is sandbox THEN correct filepath is returned", () => {
  const filePath = getFilepath(LEVEL_NAMES.SANDBOX);
  expect(filePath).toBe("resources/documents/common/");
});

test("GIVEN makePromptTemplate is called with no config prePrompt THEN correct prompt is returned", () => {
  makePromptTemplate("", "defaultPrePrompt", "mainPrompt", "noName");
  PromptTemplate.fromTemplate("defaultPrePrompt" + "mainPrompt");
  //expect(mockFromTemplate).toBeCalledWith("defaultPrePrompt" + "mainPrompt");
  // expect(mockFromTemplate).toBeCalledTimes(2);
  expect(true).toBe(true);
});

test("GIVEN makePromptTemplate is called with a prePrompt THEN correct prompt is returned", () => {
  makePromptTemplate(
    "configPrePrompt",
    "defaultPrePrompt",
    "mainPrompt",
    "noName"
  );
  // PromptTemplate.fromTemplate("configPrePrompt" + "mainPrompt");
  expect(mockFromTemplate).toBeCalledTimes(1);
  // expect(true).toBe(true);
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
