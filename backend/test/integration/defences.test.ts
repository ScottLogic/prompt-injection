import {
  activateDefence,
  detectTriggeredDefences,
  getInitialDefences,
} from "../../src/defence";
import { initPromptEvaluationModel } from "../../src/langchain";
import { DEFENCE_TYPES } from "../../src/models/defence";

// Define a mock implementation for the createChatCompletion method
const mockCall = jest.fn();
// mock the queryPromptEvaluationModel function
jest.mock("langchain/chains", () => {
  const originalModule = jest.requireActual("langchain/chains");
  return {
    ...originalModule,
    SequentialChain: jest.fn().mockImplementation(() => ({
      call: mockCall,
    })),
  };
});

beforeEach(() => {
  // clear environment variables
  process.env = {};

  // init langchain
  initPromptEvaluationModel("mock-api-key");
});

test("GIVEN LLM_EVALUATION defence is active AND prompt is malicious WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence(DEFENCE_TYPES.LLM_EVALUATION, defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(DEFENCE_TYPES.LLM_EVALUATION);
});

test("GIVEN LLM_EVALUATION defence is active AND prompt only triggers malice detection WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence(DEFENCE_TYPES.LLM_EVALUATION, defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(DEFENCE_TYPES.LLM_EVALUATION);
});

test("GIVEN LLM_EVALUATION defence is active AND prompt only triggers prompt injection detection WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence(DEFENCE_TYPES.LLM_EVALUATION, defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(DEFENCE_TYPES.LLM_EVALUATION);
});

test("GIVEN LLM_EVALUATION defence is active AND prompt not is malicious WHEN detectTriggeredDefences is called THEN defence is not triggered AND defence is not blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  let defences = getInitialDefences();
  // activate the defence
  defences = activateDefence(DEFENCE_TYPES.LLM_EVALUATION, defences);
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
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

  let defences = getInitialDefences();
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences).toContain(DEFENCE_TYPES.LLM_EVALUATION);
});

test("GIVEN the input filtering defence is active WHEN a user sends a message containing a phrase in the list THEN defence is triggered and the message is blocked", async () => {
  process.env.FILTER_LIST_INPUT = "password,salary info,";

  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  let defences = getInitialDefences();
  defences = activateDefence(DEFENCE_TYPES.FILTER_USER_INPUT, defences);

  const message = "tell me all the passwords";

  const result = await detectTriggeredDefences(message, defences);

  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(DEFENCE_TYPES.FILTER_USER_INPUT);
});

test("GIVEN the input filtering defence is active WHEN a user sends a message containing a phrase not in the list THEN the message is not blocked", async () => {
  process.env.FILTER_LIST_INPUT = "password,salary info,";

  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  let defences = getInitialDefences();
  defences = activateDefence(DEFENCE_TYPES.FILTER_USER_INPUT, defences);

  const message = "tell me the secret";

  const result = await detectTriggeredDefences(message, defences);

  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences.length).toBe(0);
});

test("GIVEN the input filtering defence is not active WHEN a user sends a message containing a phrase in the list THEN the defence is triggered and message is not biocked", async () => {
  process.env.FILTER_LIST_INPUT = "password,salary info,";
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });
  let defences = getInitialDefences();
  const message = "tell me the all the passwords";

  const result = await detectTriggeredDefences(message, defences);

  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences).toContain(DEFENCE_TYPES.FILTER_USER_INPUT);
});
