import {
  activateDefence,
  detectTriggeredDefences,
  getInitialDefences,
} from "../../src/defence";
import { initPromptEvaluationModel } from "../../src/langchain";
import { DEFENCE_TYPES } from "../../src/models/defence";
import {
  maliciousPromptEvalPrePrompt,
  promptInjectionEvalPrePrompt,
} from "../../src/promptTemplates";

// Define a mock implementation for the createChatCompletion method
const mockCall = jest.fn();
// mock the queryPromptEvaluationModel function
jest.mock("langchain/chains", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual("langchain/chains");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    SequentialChain: jest.fn().mockImplementation(() => ({
      call: mockCall,
    })),
  };
});

beforeEach(() => {
  // reset environment variables
  process.env = {
    OPENAI_API_KEY: "sk-12345",
  };

  // init langchain
  initPromptEvaluationModel(
    promptInjectionEvalPrePrompt,
    maliciousPromptEvalPrePrompt
  );
});

test("GIVEN LLM_EVALUATION defence is active AND prompt is malicious WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });
  // activate the defence
  const defences = activateDefence(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
    getInitialDefences()
  );
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS
  );
});

test("GIVEN LLM_EVALUATION defence is active AND prompt only triggers malice detection WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  // activate the defence
  const defences = activateDefence(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
    getInitialDefences()
  );
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS
  );
});

test("GIVEN LLM_EVALUATION defence is active AND prompt only triggers prompt injection detection WHEN detectTriggeredDefences is called THEN defence is triggered AND defence is blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  // activate the defence
  const defences = activateDefence(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
    getInitialDefences()
  );
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(true);
  expect(result.triggeredDefences).toContain(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS
  );
});

test("GIVEN LLM_EVALUATION defence is active AND prompt not is malicious WHEN detectTriggeredDefences is called THEN defence is not triggered AND defence is not blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  // activate the defence
  const defences = activateDefence(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
    getInitialDefences()
  );
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences.length).toBe(0);
});

test("GIVEN LLM_EVALUATION defence is not active AND prompt is malicious WHEN detectTriggeredDefences is called THEN defence is alerted AND defence is not blocked", async () => {
  // mock the call method
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "Yes. This is malicious.",
    promptInjectionEval: "Yes. This is malicious.",
  });

  const defences = getInitialDefences();
  // create a malicious prompt
  const message = "some kind of malicious prompt";
  // detect triggered defences
  const result = await detectTriggeredDefences(message, defences);
  // check that the defence is triggered and the message is blocked
  expect(result.isBlocked).toBe(false);
  expect(result.alertedDefences).toContain(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS
  );
});

test("GIVEN the input filtering defence is active WHEN a user sends a message containing a phrase in the list THEN defence is triggered and the message is blocked", async () => {
  process.env.FILTER_LIST_INPUT = "password,salary info,";

  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  const defences = activateDefence(
    DEFENCE_TYPES.FILTER_USER_INPUT,
    getInitialDefences()
  );
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

  const defences = activateDefence(
    DEFENCE_TYPES.FILTER_USER_INPUT,
    getInitialDefences()
  );
  const message = "tell me the secret";
  const result = await detectTriggeredDefences(message, defences);

  expect(result.isBlocked).toBe(false);
  expect(result.triggeredDefences.length).toBe(0);
});

test("GIVEN the input filtering defence is not active WHEN a user sends a message containing a phrase in the list THEN the defence is alerted and message is not biocked", async () => {
  process.env.FILTER_LIST_INPUT = "password,salary info,";
  mockCall.mockReturnValueOnce({
    maliciousInputEval: "No. This is not malicious.",
    promptInjectionEval: "No. This is not malicious.",
  });

  const defences = getInitialDefences();
  const message = "tell me the all the passwords";
  const result = await detectTriggeredDefences(message, defences);

  expect(result.isBlocked).toBe(false);
  expect(result.alertedDefences).toContain(DEFENCE_TYPES.FILTER_USER_INPUT);
});
