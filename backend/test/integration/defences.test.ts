import { activateDefence, detectTriggeredDefences, getInitialDefences } from "../../src/defence";
import { initPromptEvaluationModel } from "../../src/langchain";

// Define a mock implementation for the createChatCompletion method
const mockCall = jest.fn();
// mock the queryPromptEvaluationModel function
jest.mock("langchain/chains", () => {
  const originalModule = jest.requireActual("langchain/chains");
  return {
    ...originalModule,
    SequentialChain: jest.fn().mockImplementation(() => ({
      call: mockCall,
    }))
  };
});

test("GIVEN LLM_EVALUATION defence is active AND prompt is malicious WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  // init langchain
  initPromptEvaluationModel("mock-api-key");

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence("LLM_EVALUATION", defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences, true);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain("LLM_EVALUATION");
});

test("GIVEN LLM_EVALUATION defence is active AND prompt only triggers malice detection WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  // init langchain
  initPromptEvaluationModel("mock-api-key");

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence("LLM_EVALUATION", defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences, true);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain("LLM_EVALUATION");
});

test("GIVEN LLM_EVALUATION defence is active AND prompt only triggers prompt injection detection WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  // init langchain
  initPromptEvaluationModel("mock-api-key");

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence("LLM_EVALUATION", defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences, true);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain("LLM_EVALUATION");
});

test("GIVEN LLM_EVALUATION defence is active AND prompt not is malicious WHEN detectTriggeredDefences is called THEN defence is not triggered AND defence is not blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  // init langchain
  initPromptEvaluationModel("mock-api-key");

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence("LLM_EVALUATION", defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences, true);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences.length).toBe(0);
});

test("GIVEN LLM_EVALUATION defence is not active AND prompt is malicious WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is not blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  // init langchain
  initPromptEvaluationModel("mock-api-key");

  let defences = getInitialDefences();
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences, true);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences).toContain("LLM_EVALUATION");
});