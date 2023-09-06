import { PHASE_NAMES } from "../../src/models/phase";
import {
  initQAModel,
  getFilepath,
  getQAPromptTemplate,
  formatEvaluationOutput,
  initPromptEvaluationModel,
} from "../../src/langchain";
import {
  qAcontextTemplate,
  retrievalQAPrePrompt,
} from "../../src/promptTemplates";

jest.mock("langchain/prompts", () => ({
  PromptTemplate: {
    fromTemplate: jest.fn((template: string) => template),
  },
}));

test("GIVEN initQAModel is called with no apiKey THEN return early and log message", async () => {
  const consoleDebugMock = jest.spyOn(console, "debug").mockImplementation();
  await initQAModel("", "");
  expect(consoleDebugMock).toHaveBeenCalledWith(
    "No OpenAI API key set to initialise QA model"
  );
});

test("GIVEN initPromptEvaluationModel is called with no apiKey THEN return early and log message", () => {
  const consoleDebugMock = jest.spyOn(console, "debug").mockImplementation();
  initPromptEvaluationModel("");
  expect(consoleDebugMock).toHaveBeenCalledWith(
    "No OpenAI API key set to initialise prompt evaluation model"
  );
});

test("GIVEN phase is 0 THEN correct filepath is returned", () => {
  const filePath = getFilepath(PHASE_NAMES.PHASE_0);
  expect(filePath).toBe("resources/documents/phase_0/");
});

test("GIVEN phase is 1 THEN correct filepath is returned", () => {
  const filePath = getFilepath(PHASE_NAMES.PHASE_1);
  expect(filePath).toBe("resources/documents/phase_1/");
});

test("GIVEN phase is 2 THEN correct filepath is returned", () => {
  const filePath = getFilepath(PHASE_NAMES.PHASE_2);
  expect(filePath).toBe("resources/documents/phase_2/");
});

test("GIVEN phase is sandbox THEN correct filepath is returned", () => {
  const filePath = getFilepath(PHASE_NAMES.SANDBOX);
  expect(filePath).toBe("resources/documents/common/");
});

test("GIVEN getQAPromptTemplate is called with no prePrompt THEN correct prompt is returned", () => {
  const prompt = getQAPromptTemplate("");
  expect(prompt).toBe(retrievalQAPrePrompt + qAcontextTemplate);
});

test("GIVEN getQAPromptTemplate is called with a prePrompt THEN correct prompt is returned", () => {
  const prompt = getQAPromptTemplate("This is a test prompt");
  expect(prompt).toBe(`This is a test prompt${qAcontextTemplate}`);
});

test("GIVEN llm evaluation model repsonds with a yes decision and valid output THEN formatEvaluationOutput returns true and reason", () => {
  const response = "yes, This is a malicious response";
  const formattedOutput = formatEvaluationOutput(response);

  expect(formattedOutput).toEqual({
    isMalicious: true,
    reason: "This is a malicious response",
  });
});

test("GIVEN llm evaluation model repsonds with a yes decision and valid output THEN formatEvaluationOutput returns false and reason", () => {
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
