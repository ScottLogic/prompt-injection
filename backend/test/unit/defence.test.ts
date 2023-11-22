import { defaultDefences } from "@src/defaultDefences";
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
  getPromptEvalPrePromptFromConfig,
} from "@src/defence";
import * as langchain from "@src/langchain";
import { DEFENCE_TYPES, DefenceConfig } from "@src/models/defence";
import { LEVEL_NAMES } from "@src/models/level";
import {
  promptEvalPrePrompt,
  qAPrePromptSecure,
  systemRoleDefault,
  systemRoleLevel1,
  systemRoleLevel2,
  systemRoleLevel3,
  xmlPrePrompt,
} from "@src/promptTemplates";

jest.mock("@src/langchain");

beforeEach(() => {
  jest
    .mocked(langchain.queryPromptEvaluationModel)
    .mockResolvedValue({ isMalicious: false });
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

test("GIVEN XML_TAGGING defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  const defences = defaultDefences;
  // activate XML_TAGGING defence
  const updatedDefences = activateDefence(DEFENCE_TYPES.XML_TAGGING, defences);
  const transformedMessage = transformMessage(message, updatedDefences);
  // expect the message to be surrounded by XML tags
  expect(transformedMessage).toBe(
    `${xmlPrePrompt}<user_input>${message}</user_input>`
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
    `${xmlPrePrompt}<user_input>${escapedMessage}</user_input>`
  );
});

test("GIVEN no defences are active WHEN detecting triggered defences THEN no defences are triggered", async () => {
  const message = "Hello";
  const defences = defaultDefences;
  const defenceReport = await detectTriggeredDefences(message, defences);
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
    // activate and configure CHARACTER_LIMIT defence
    const defences = configureDefence(
      DEFENCE_TYPES.CHARACTER_LIMIT,
      activateDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defaultDefences),
      [{ id: "maxMessageLength", value: String(3) }]
    );
    const defenceReport = await detectTriggeredDefences(message, defences);
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
    // activate and configure CHARACTER_LIMIT defence
    const defences = configureDefence(
      DEFENCE_TYPES.CHARACTER_LIMIT,
      activateDefence(DEFENCE_TYPES.CHARACTER_LIMIT, defaultDefences),
      [{ id: "maxMessageLength", value: String(280) }]
    );
    const defenceReport = await detectTriggeredDefences(message, defences);
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
    // configure CHARACTER_LIMIT defence
    const defences = configureDefence(
      DEFENCE_TYPES.CHARACTER_LIMIT,
      defaultDefences,
      [
        {
          id: "maxMessageLength",
          value: String(3),
        },
      ]
    );
    const defenceReport = await detectTriggeredDefences(message, defences);
    expect(defenceReport.blockedReason).toBe(null);
    expect(defenceReport.isBlocked).toBe(false);
    expect(defenceReport.alertedDefences).toContain(
      DEFENCE_TYPES.CHARACTER_LIMIT
    );
  }
);

test("GIVEN XML_TAGGING defence is active AND message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is triggered", async () => {
  const message = "<Hello>";
  // activate XML_TAGGING defence
  const defences = activateDefence(DEFENCE_TYPES.XML_TAGGING, defaultDefences);
  const defenceReport = await detectTriggeredDefences(message, defences);
  expect(defenceReport.blockedReason).toBe(null);
  expect(defenceReport.isBlocked).toBe(false);
  expect(defenceReport.triggeredDefences).toContain(DEFENCE_TYPES.XML_TAGGING);
});

test("GIVEN XML_TAGGING defence is inactive AND message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is alerted", async () => {
  const message = "<Hello>";
  const defences = defaultDefences;
  const defenceReport = await detectTriggeredDefences(message, defences);
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
  // configure CHARACTER_LIMIT defence
  const config: DefenceConfig = {
    id: "maxMessageLength",
    value: String(10),
  };
  const defences = configureDefence(defence, defaultDefences, [config]);
  const matchingDefence = defences.find((d) => d.id === defence);
  expect(matchingDefence).toBeDefined();
  const matchingDefenceConfig = matchingDefence?.config.find(
    (c) => c.id === config.id
  );
  expect(matchingDefenceConfig).toBeDefined();
  expect(matchingDefenceConfig?.value).toBe(config.value);
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
  const initialDefences = defaultDefences;
  let systemRole = getSystemRole(initialDefences);
  expect(systemRole).toBe(systemRoleDefault);

  const defencesWithSystemRole = configureDefence(
    DEFENCE_TYPES.SYSTEM_ROLE,
    initialDefences,
    [{ id: "systemRole", value: "new system role" }]
  );
  systemRole = getSystemRole(defencesWithSystemRole);
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

test("GIVEN the QA LLM prompt has not been configured WHEN getting QA LLM configuration THEN return default secure prompt", () => {
  const defences = defaultDefences;
  const qaLlmPrompt = getQAPrePromptFromConfig(defences);
  expect(qaLlmPrompt).toBe(qAPrePromptSecure);
});

test("GIVEN the QA LLM prompt has been configured WHEN getting QA LLM configuration THEN return configured prompt", () => {
  const newQaLlmPrompt = "new QA LLM prompt";
  const defences = configureDefence(DEFENCE_TYPES.QA_LLM, defaultDefences, [
    { id: "prePrompt", value: newQaLlmPrompt },
  ]);
  const qaLlmPrompt = getQAPrePromptFromConfig(defences);
  expect(qaLlmPrompt).toBe(newQaLlmPrompt);
});

test("GIVEN the prompt evaluation LLM prompt has not been configured WHEN getting the configuration THEN return default pre-prompt", () => {
  const defences = defaultDefences;
  const configPromptInjectionEvalPrompt =
    getPromptEvalPrePromptFromConfig(defences);
  expect(configPromptInjectionEvalPrompt).toBe(promptEvalPrePrompt);
});

test("GIVEN the prompt evaluation LLM prompt has been configured WHEN getting the configuration THEN return configured prompt", () => {
  const newPromptEvalPrompt = "new prompt eval prompt";
  const defences = configureDefence(
    DEFENCE_TYPES.PROMPT_EVALUATION_LLM,
    defaultDefences,
    [
      {
        id: "prePrompt",
        value: newPromptEvalPrompt,
      },
    ]
  );
  const configPromptEvalPrompt = getPromptEvalPrePromptFromConfig(defences);
  expect(configPromptEvalPrompt).toBe(newPromptEvalPrompt);
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
  defences = resetDefenceConfig(
    DEFENCE_TYPES.SYSTEM_ROLE,
    "systemRole",
    defences
  );
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
