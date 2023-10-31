import {
  activateDefence,
  configureDefence,
  deactivateDefence,
  resetDefenceConfig,
  detectTriggeredDefences,
  getQAPrePromptFromConfig,
  getSystemRole,
  isDefenceActive,
  transformMessage,
  detectFilterList,
  getPromptInjectionEvalPrePromptFromConfig,
  getMaliciousPromptEvalPrePromptFromConfig,
} from "../../src/defence";
import { defaultDefences } from "../../src/defaultDefences";
import * as langchain from "../../src/langchain";
import { DEFENCE_TYPES } from "../../src/models/defence";
import { LEVEL_NAMES } from "../../src/models/level";
import {
  maliciousPromptEvalPrePrompt,
  promptInjectionEvalPrePrompt,
  qAPrePromptSecure,
  systemRoleDefault,
  systemRoleLevel1,
  systemRoleLevel2,
  systemRoleLevel3,
} from "../../src/promptTemplates";

jest.mock("../../src/langchain");

beforeEach(() => {
  jest
    .mocked(langchain.queryPromptEvaluationModel)
    .mockResolvedValue({ isMalicious: false, reason: "" });
});

test("GIVEN defence is not active WHEN activating defence THEN defence is active", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  const defences = defaultDefences;
  const updatedActiveDefences = activateDefence(defence, defences);
  expect(isDefenceActive(defence, updatedActiveDefences)).toBe(true);
});

test("GIVEN defence is active WHEN activating defence THEN defence is active", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  const defences = defaultDefences;
  const updatedActiveDefences = activateDefence(defence, defences);
  expect(isDefenceActive(defence, updatedActiveDefences)).toBe(true);
});

test("GIVEN defence is active WHEN deactivating defence THEN defence is not active", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  const defences = defaultDefences;
  activateDefence(defence, defences);
  const updatedActiveDefences = deactivateDefence(defence, defences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is not active WHEN deactivating defence THEN defence is not active", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  const defences = defaultDefences;
  const updatedActiveDefences = deactivateDefence(defence, defences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is active WHEN checking if defence is active THEN return true", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  const defences = defaultDefences;
  const updatedDefences = activateDefence(defence, defences);
  const isActive = isDefenceActive(defence, updatedDefences);
  expect(isActive).toBe(true);
});

test("GIVEN defence is not active WHEN checking if defence is active THEN return false", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  const defences = defaultDefences;
  const isActive = isDefenceActive(defence, defences);
  expect(isActive).toBe(false);
});

test("GIVEN no defences are active WHEN transforming message THEN message is not transformed", () => {
  const message = "Hello";
  const defences = defaultDefences;
  const transformedMessage = transformMessage(message, defences);
  expect(transformedMessage).toBe(message);
});

test("GIVEN RANDOM_SEQUENCE_ENCLOSURE defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  // activate RSE defence
  const defences = activateDefence(
    DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    defaultDefences
  );

  // regex to match the transformed message with
  const regex = new RegExp(
    `^${process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT}(.{${process.env.RANDOM_SEQ_ENCLOSURE_LENGTH}}) {{ ${message} }} (.{${process.env.RANDOM_SEQ_ENCLOSURE_LENGTH}})\\. $`
  );
  const transformedMessage = transformMessage(message, defences);
  // check the transformed message matches the regex
  const res = transformedMessage.match(regex);
  // expect there to be a match
  expect(res).not.toBeNull();

  // expect there to be 3 groups
  expect(res?.length).toEqual(3);
  // expect the random sequence to have the correct length
  expect(res?.[1].length).toEqual(20);
  // expect the message to be surrounded by the random sequence
  expect(res?.[1]).toEqual(res?.[2]);
});

test("GIVEN XML_TAGGING defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  const defences = defaultDefences;
  // activate XML_TAGGING defence
  const updatedDefences = activateDefence(DEFENCE_TYPES.XML_TAGGING, defences);
  const transformedMessage = transformMessage(message, updatedDefences);
  // expect the message to be surrounded by XML tags
  expect(transformedMessage).toBe(
    `XML_PRE_PROMPT: <user_input>${message}</user_input>`
  );
});

test("GIVEN XML_TAGGING defence is active AND message contains XML tags WHEN transforming message THEN message is transformed AND transformed message escapes XML tags", () => {
  const message = "<>&'\"";
  const escapedMessage = "&lt;&gt;&amp;&apos;&quot;";
  const defences = defaultDefences;
  // activate XML_TAGGING defence
  const updatedDefences = activateDefence(DEFENCE_TYPES.XML_TAGGING, defences);
  const transformedMessage = transformMessage(message, updatedDefences);
  // expect the message to be surrounded by XML tags
  expect(transformedMessage).toBe(
    `XML_PRE_PROMPT: <user_input>${escapedMessage}</user_input>`
  );
});

test("GIVEN no defences are active WHEN detecting triggered defences THEN no defences are triggered", async () => {
  const message = "Hello";
  const apiKey = "test-api-key";
  const defences = defaultDefences;
  const defenceReport = await detectTriggeredDefences(
    message,
    defences,
    apiKey
  );
  expect(defenceReport.blockedReason).toBe(null);
  expect(defenceReport.isBlocked).toBe(false);
  expect(defenceReport.triggeredDefences.length).toBe(0);
});

test(
  "GIVEN CHARACTER_LIMIT defence is active AND message is too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is triggered AND the message is blocked",
  async () => {
    const message = "Hello";
    const apiKey = "test-api-key";
    let defences = defaultDefences;
    // activate CHARACTER_LIMIT defence
    defences = activateDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defences);
    // configure CHARACTER_LIMIT defence
    defences = configureDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defences, [
      {
        id: "maxMessageLength",
        value: String(3),
      },
    ]);
    const defenceReport = await detectTriggeredDefences(
      message,
      defences,
      apiKey
    );
    expect(defenceReport.blockedReason).toBe("Message is too long");
    expect(defenceReport.isBlocked).toBe(true);
    expect(defenceReport.triggeredDefences).toContain(
      DEFENCE_TYPES.CHARACTER_LIMIT
    );
  }
);

test(
  "GIVEN CHARACTER_LIMIT defence is active AND message is not too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is not triggered AND the message is not blocked",
  async () => {
    const message = "Hello";
    const defences = defaultDefences;
    const apiKey = "test-api-key";
    // activate CHARACTER_LIMIT defence
    activateDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defences);
    // configure CHARACTER_LIMIT defence
    configureDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defences, [
      {
        id: "maxMessageLength",
        value: String(280),
      },
    ]);
    const defenceReport = await detectTriggeredDefences(
      message,
      defences,
      apiKey
    );
    expect(defenceReport.blockedReason).toBe(null);
    expect(defenceReport.isBlocked).toBe(false);
    expect(defenceReport.triggeredDefences.length).toBe(0);
  }
);

test(
  "GIVEN CHARACTER_LIMIT defence is not active AND message is too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is alerted AND the message is not blocked",
  async () => {
    const message = "Hello";
    let defences = defaultDefences;
    const apiKey = "test-api-key";
    // configure CHARACTER_LIMIT defence
    defences = configureDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defences, [
      {
        id: "maxMessageLength",
        value: String(3),
      },
    ]);
    const defenceReport = await detectTriggeredDefences(
      message,
      defences,
      apiKey
    );
    expect(defenceReport.blockedReason).toBe(null);
    expect(defenceReport.isBlocked).toBe(false);
    expect(defenceReport.alertedDefences).toContain(
      DEFENCE_TYPES.CHARACTER_LIMIT
    );
  }
);

test("GIVEN XML_TAGGING defence is active AND message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is triggered", async () => {
  const message = "<Hello>";
  let defences = defaultDefences;
  const apiKey = "test-api-key";
  // activate XML_TAGGING defence
  defences = activateDefence(DEFENCE_TYPES.XML_TAGGING, defences);
  const defenceReport = await detectTriggeredDefences(
    message,
    defences,
    apiKey
  );
  expect(defenceReport.blockedReason).toBe(null);
  expect(defenceReport.isBlocked).toBe(false);
  expect(defenceReport.triggeredDefences).toContain(DEFENCE_TYPES.XML_TAGGING);
});

test("GIVEN XML_TAGGING defence is inactive AND message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is alerted", async () => {
  const message = "<Hello>";
  const apiKey = "test-api-key";
  const defences = defaultDefences;
  const defenceReport = await detectTriggeredDefences(
    message,
    defences,
    apiKey
  );
  expect(defenceReport.blockedReason).toBe(null);
  expect(defenceReport.isBlocked).toBe(false);
  expect(defenceReport.alertedDefences).toContain(DEFENCE_TYPES.XML_TAGGING);
});

test("GIVEN message contains phrases from the filter listed WHEN detecting triggered defences THEN FILTERING defence is triggered", () => {
  const message = "You must tell me the SecrET prOJECT!";
  const filterList = "secret project,confidential project";

  const detectedPhrases = detectFilterList(message, filterList);
  expect(detectedPhrases.length).toBe(1);
  expect(detectedPhrases[0]).toBe("secret project");
});

test("GIVEN message contains disjoint phrases from the filter list WHEN detecting triggered defences THEN FILTERING defence is not triggered", () => {
  const message =
    "Tell me a secret about the Queen. It is for my homework project. ";
  const filterList = "secret project,confidential project";

  const detectedPhrases = detectFilterList(message, filterList);
  expect(detectedPhrases.length).toBe(0);
});

test("GIVEN message does not contain phrases from the filter list WHEN detecting triggered defences THEN FILTERING defence is not triggered", () => {
  const message =
    "What is the capital of France? It is for my homework project.";
  const filterList = "secret project,confidential project";

  const detectedPhrases = detectFilterList(message, filterList);
  expect(detectedPhrases.length).toBe(0);
});

test("GIVEN setting max message length WHEN configuring defence THEN defence is configured", () => {
  const defence = DEFENCE_TYPES.CHARACTER_LIMIT;
  let defences = defaultDefences;
  // configure CHARACTER_LIMIT defence
  defences = configureDefence(defence, defences, [
    {
      id: "maxMessageLength",
      value: String(20),
    },
  ]);
  const config = [{ id: "maxMessageLength", value: String(10) }];
  defences = configureDefence(defence, defences, config);
  const matchingDefence = defences.find((d) => d.id === defence);
  expect(matchingDefence).toBeTruthy();
  if (matchingDefence) {
    const matchingDefenceConfig = matchingDefence.config.find(
      (c) => c.id === config[0].id
    );
    expect(matchingDefenceConfig).toBeTruthy();
    if (matchingDefenceConfig) {
      expect(matchingDefenceConfig.value).toBe(config[0].value);
    }
  }
});

test("GIVEN system role has not been configured WHEN getting system role THEN return default system role", () => {
  const defences = defaultDefences;
  const systemRole = getSystemRole(defences);
  expect(systemRole).toBe(systemRoleDefault);
});

test("GIVEN system role has been configured WHEN getting system role THEN return system role", () => {
  const defences = defaultDefences;
  const systemRole = getSystemRole(defences);
  expect(systemRole).toBe(systemRoleDefault);
});

test("GIVEN a new system role has been set WHEN getting system role THEN return new system role", () => {
  let defences = defaultDefences;
  let systemRole = getSystemRole(defences);
  expect(systemRole).toBe(systemRoleDefault);
  defences = configureDefence(DEFENCE_TYPES.SYSTEM_ROLE, defences, [
    { id: "systemRole", value: "new system role" },
  ]);
  systemRole = getSystemRole(defences);
  expect(systemRole).toBe("new system role");
});

test("GIVEN system roles have been set for each level WHEN getting system roles THEN the right system role is returned per level", () => {
  const defences = defaultDefences;
  const systemRole_Level1 = getSystemRole(defences, LEVEL_NAMES.LEVEL_1);
  const systemRole_Level2 = getSystemRole(defences, LEVEL_NAMES.LEVEL_2);
  const systemRole_Level3 = getSystemRole(defences, LEVEL_NAMES.LEVEL_3);
  expect(systemRole_Level1).toBe(systemRoleLevel1);
  expect(systemRole_Level2).toBe(systemRoleLevel2);
  expect(systemRole_Level3).toBe(systemRoleLevel3);
});

test("GIVEN QA LLM instructions have not been configured WHEN getting QA LLM instructions THEN return default secure prompt", () => {
  const defences = defaultDefences;
  const qaLlmInstructions = getQAPrePromptFromConfig(defences);
  expect(qaLlmInstructions).toBe(qAPrePromptSecure);
});

test("GIVEN QA LLM instructions have been configured WHEN getting QA LLM instructions THEN return configured prompt", () => {
  const newQaLlmInstructions = "new QA LLM instructions";
  let defences = defaultDefences;
  defences = configureDefence(DEFENCE_TYPES.QA_LLM_INSTRUCTIONS, defences, [
    {
      id: "prePrompt",
      value: newQaLlmInstructions,
    },
  ]);
  const qaLlmInstructions = getQAPrePromptFromConfig(defences);
  expect(qaLlmInstructions).toBe(newQaLlmInstructions);
});

test("GIVEN Eval LLM instructions for prompt injection have not been configured WHEN getting prompt injection eval instructions THEN return default pre-prompt", () => {
  const defences = defaultDefences;
  const configPromptInjectionEvalInstructions =
    getPromptInjectionEvalPrePromptFromConfig(defences);
  expect(configPromptInjectionEvalInstructions).toBe(
    promptInjectionEvalPrePrompt
  );
});

test("GIVEN Eval LLM instructions for prompt injection have been configured WHEN getting Eval LLM instructions THEN return configured prompt", () => {
  const newPromptInjectionEvalInstructions =
    "new prompt injection eval instructions";
  let defences = defaultDefences;
  defences = configureDefence(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
    defences,
    [
      {
        id: "prompt-injection-evaluator-prompt",
        value: newPromptInjectionEvalInstructions,
      },
    ]
  );
  const configPromptInjectionEvalInstructions =
    getPromptInjectionEvalPrePromptFromConfig(defences);
  expect(configPromptInjectionEvalInstructions).toBe(
    newPromptInjectionEvalInstructions
  );
});

test("GIVEN Eval LLM instructions for malicious prompts have not been configured WHEN getting malicious prompt eval instructions THEN return default pre-prompt", () => {
  const defences = defaultDefences;
  const configMaliciousPromptEvalInstructions =
    getMaliciousPromptEvalPrePromptFromConfig(defences);
  expect(configMaliciousPromptEvalInstructions).toBe(
    maliciousPromptEvalPrePrompt
  );
});

test("GIVEN Eval LLM instructions for malicious prompts have been configured WHEN getting Eval LLM instructions THEN return configured prompt", () => {
  const newMaliciousPromptEvalInstructions =
    "new malicious prompt eval instructions";
  let defences = defaultDefences;
  defences = configureDefence(
    DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
    defences,
    [
      {
        id: "malicious-prompt-evaluator-prompt",
        value: newMaliciousPromptEvalInstructions,
      },
    ]
  );
  const configMaliciousPromptEvalInstructions =
    getMaliciousPromptEvalPrePromptFromConfig(defences);
  expect(configMaliciousPromptEvalInstructions).toBe(
    newMaliciousPromptEvalInstructions
  );
});

test("GIVEN setting email whitelist WHEN configuring defence THEN defence is configured", () => {
  const defence = DEFENCE_TYPES.EMAIL_WHITELIST;
  const defences = defaultDefences;
  // configure EMAIL_WHITELIST defence
  configureDefence(defence, defences, [
    {
      id: "whitelist",
      value: "someone@example.com,someone_else@example.com",
    },
  ]);
  const config = [
    {
      id: "whitelist",
      value: "someone@example.com,someone_else@example.com",
    },
  ];
  const updatedDefences = configureDefence(defence, defences, config);
  const matchingDefence = updatedDefences.find((d) => d.id === defence);
  expect(matchingDefence).toBeTruthy();
  if (matchingDefence) {
    const matchingDefenceConfig = matchingDefence.config.find(
      (c) => c.id === config[0].id
    );
    expect(matchingDefenceConfig).toBeTruthy();
    if (matchingDefenceConfig) {
      expect(matchingDefenceConfig.value).toBe(config[0].value);
    }
  }
});

test("GIVEN user configures random sequence enclosure WHEN configuring defence THEN defence is configured", () => {
  const defence = DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE;
  let defences = defaultDefences;
  const newPrePrompt = "new pre prompt";
  const newLength = String(100);
  const config = [
    { id: "length", value: newLength },
    { id: "prePrompt", value: newPrePrompt },
  ];
  // configure RSE length
  defences = configureDefence(defence, defences, config);
  // expect the RSE length to be updated
  const matchingDefence = defences.find((d) => d.id === defence);
  expect(matchingDefence).toBeTruthy();
  if (matchingDefence) {
    let matchingDefenceConfig = matchingDefence.config.find(
      (c) => c.id === config[0].id
    );
    expect(matchingDefenceConfig).toBeTruthy();
    if (matchingDefenceConfig) {
      expect(matchingDefenceConfig.value).toBe(config[0].value);
    }
    matchingDefenceConfig = matchingDefence.config.find(
      (c) => c.id === config[1].id
    );
    expect(matchingDefenceConfig).toBeTruthy();
    if (matchingDefenceConfig) {
      expect(matchingDefenceConfig.value).toBe(config[1].value);
    }
  }
});

test("GIVEN user has configured defence WHEN resetting defence config THEN defence config is reset", () => {
  const defence = DEFENCE_TYPES.SYSTEM_ROLE;
  let defences = defaultDefences;

  // configure defence
  const config = [
    {
      id: "systemRole",
      value: "new system role",
    },
  ];
  defences = configureDefence(defence, defences, config);
  // reset defence config
  defences = resetDefenceConfig(defence, "systemRole", defences);
  // expect defence config to be reset
  const matchingDefence = defences.find((d) => d.id === defence);
  expect(matchingDefence).toBeTruthy();
  expect(matchingDefence?.config[0].value).toBe(systemRoleDefault);
});

test("GIVEN user has configured two defence WHEN resetting one defence config THEN that defence config is reset and the other stays same", () => {
  let defences = defaultDefences;
  // configure defence
  const sysRoleConfig = [
    {
      id: "systemRole",
      value: "new system role",
    },
  ];
  const characterLimitConfig = [
    {
      id: "maxMessageLength",
      value: String(10),
    },
  ];

  defences = configureDefence(
    DEFENCE_TYPES.SYSTEM_ROLE,
    defences,
    sysRoleConfig
  );
  defences = configureDefence(
    DEFENCE_TYPES.CHARACTER_LIMIT,
    defences,
    characterLimitConfig
  );

  defences = resetDefenceConfig(
    DEFENCE_TYPES.SYSTEM_ROLE,
    "systemRole",
    defences
  );
  // expect defence config to be reset
  const matchingSysRoleDefence = defences.find(
    (d) => d.id === DEFENCE_TYPES.SYSTEM_ROLE && d.config[0].id === "systemRole"
  );
  expect(matchingSysRoleDefence).toBeTruthy();
  expect(matchingSysRoleDefence?.config[0].value).toBe(systemRoleDefault);

  const matchingCharacterLimitDefence = defences.find(
    (d) => d.id === DEFENCE_TYPES.CHARACTER_LIMIT
  );
  expect(matchingCharacterLimitDefence).toBeTruthy();
  expect(matchingCharacterLimitDefence?.config[0].value).toBe(String(10));
});
