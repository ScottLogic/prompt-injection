import {
  activateDefence,
  configureDefence,
  deactivateDefence,
  detectTriggeredDefences,
  getInitialDefences,
  getSystemRole,
  isDefenceActive,
  transformMessage,
} from "../../src/defence";

test("GIVEN defence is not active WHEN activating defence THEN defence is active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = getInitialDefences();
  const updatedActiveDefences = activateDefence(defence, defences);
  expect(isDefenceActive(defence, updatedActiveDefences)).toBe(true);
});

test("GIVEN defence is active WHEN activating defence THEN defence is active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = getInitialDefences();
  const updatedActiveDefences = activateDefence(defence, defences);
  expect(isDefenceActive(defence, updatedActiveDefences)).toBe(true);
});

test("GIVEN defence is active WHEN deactivating defence THEN defence is not active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = getInitialDefences();
  activateDefence(defence, defences);
  const updatedActiveDefences = deactivateDefence(defence, defences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is not active WHEN deactivating defence THEN defence is not active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = getInitialDefences();
  const updatedActiveDefences = deactivateDefence(defence, defences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is active WHEN checking if defence is active THEN return true", () => {
  const defence = "SYSTEM_ROLE";
  const defences = getInitialDefences();
  const updatedDefences = activateDefence(defence, defences);
  const isActive = isDefenceActive(defence, updatedDefences);
  expect(isActive).toBe(true);
});

test("GIVEN defence is not active WHEN checking if defence is active THEN return false", () => {
  const defence = "SYSTEM_ROLE";
  const defences = getInitialDefences();
  const isActive = isDefenceActive(defence, defences);
  expect(isActive).toBe(false);
});

test("GIVEN no defences are active WHEN transforming message THEN message is not transformed", () => {
  const message = "Hello";
  const defences = getInitialDefences();
  const transformedMessage = transformMessage(message, defences);
  expect(transformedMessage).toBe(message);
});

test("GIVEN RANDOM_SEQUENCE_ENCLOSURE defence is active WHEN transforming message THEN message is transformed", () => {
  // set RSE prompt
  process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT = "RSE_PRE_PROMPT ";
  // set RSE length
  process.env.RANDOM_SEQ_ENCLOSURE_LENGTH = String(20);

  const message = "Hello";
  let defences = getInitialDefences();
  // activate RSE defence
  defences = activateDefence("RANDOM_SEQUENCE_ENCLOSURE", defences);

  // regex to match the transformed message with
  const regex = new RegExp(
    "^" +
      process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT +
      "(.{" +
      process.env.RANDOM_SEQ_ENCLOSURE_LENGTH +
      "}) {{ " +
      message +
      " }} (.{" +
      process.env.RANDOM_SEQ_ENCLOSURE_LENGTH +
      "})\\. $"
  );
  const transformedMessage = transformMessage(message, defences);
  // check the transformed message matches the regex
  const res = transformedMessage.match(regex);
  // expect there to be a match
  expect(res).toBeTruthy();
  if (res) {
    // expect there to be 3 groups
    expect(res.length).toBe(3);
    // expect the random sequence to have the correct length
    expect(res[1].length).toBe(Number(process.env.RANDOM_SEQ_ENCLOSURE_LENGTH));
    // expect the message to be surrounded by the random sequence
    expect(res[1]).toBe(res[2]);
  }
});

test("GIVEN XML_TAGGING defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  const defences = getInitialDefences();
  // activate XML_TAGGING defence
  const updatedDefences = activateDefence("XML_TAGGING", defences);
  const transformedMessage = transformMessage(message, updatedDefences);
  // expect the message to be surrounded by XML tags
  expect(transformedMessage).toBe("<user_input>" + message + "</user_input>");
});

test("GIVEN no defences are active WHEN detecting triggered defences THEN no defences are triggered", async () => {
  const message = "Hello";
  const defences = getInitialDefences();
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
    let defences = getInitialDefences();
    // activate CHARACTER_LIMIT defence
    defences = activateDefence("CHARACTER_LIMIT", defences);
    // configure CHARACTER_LIMIT defence
    defences = configureDefence("CHARACTER_LIMIT", defences, [
      {
        id: "maxMessageLength",
        value: String(3),
      },
    ]);
    const defenceReport = await detectTriggeredDefences(message, defences);
    expect(defenceReport.blockedReason).toBe("Message is too long");
    expect(defenceReport.isBlocked).toBe(true);
    expect(defenceReport.triggeredDefences).toContain("CHARACTER_LIMIT");
  }
);

test(
  "GIVEN CHARACTER_LIMIT defence is active AND message is not too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is not triggered AND the message is not blocked",
  async () => {
    const message = "Hello";
    const defences = getInitialDefences();
    // activate CHARACTER_LIMIT defence
    activateDefence("CHARACTER_LIMIT", defences);
    // configure CHARACTER_LIMIT defence
    configureDefence("CHARACTER_LIMIT", defences, [
      {
        id: "maxMessageLength",
        value: String(280),
      },
    ]);
    const defenceReport = await detectTriggeredDefences(message, defences);
    expect(defenceReport.blockedReason).toBe(null);
    expect(defenceReport.isBlocked).toBe(false);
    expect(defenceReport.triggeredDefences.length).toBe(0);
  }
);

test(
  "GIVEN CHARACTER_LIMIT defence is not active AND message is too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is triggered AND the message is not blocked",
  async () => {
    const message = "Hello";
    let defences = getInitialDefences();
    // configure CHARACTER_LIMIT defence
    defences = configureDefence("CHARACTER_LIMIT", defences, [
      {
        id: "maxMessageLength",
        value: String(3),
      },
    ]);
    const defenceReport = await detectTriggeredDefences(message, defences);
    expect(defenceReport.blockedReason).toBe(null);
    expect(defenceReport.isBlocked).toBe(false);
    expect(defenceReport.triggeredDefences).toContain("CHARACTER_LIMIT");
  }
);

test("GIVEN message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is triggered", async () => {
  const message = "<Hello>";
  const defences = getInitialDefences();
  const defenceReport = await detectTriggeredDefences(message, defences);
  expect(defenceReport.blockedReason).toBe(null);
  expect(defenceReport.isBlocked).toBe(false);
  expect(defenceReport.triggeredDefences).toContain("XML_TAGGING");
});

test("GIVEN setting max message length WHEN configuring defence THEN defence is configured", () => {
  const defence = "CHARACTER_LIMIT";
  let defences = getInitialDefences();
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

test("GIVEN system role has not been configured WHEN getting system role THEN return empty string", () => {
  const defences = getInitialDefences();
  const systemRole = getSystemRole(defences);
  expect(systemRole).toBe("");
});

test("GIVEN system role has been configured WHEN getting system role THEN return system role", () => {
  process.env.SYSTEM_ROLE = "system role";
  const defences = getInitialDefences();
  const systemRole = getSystemRole(defences);
  expect(systemRole).toBe("system role");
});

test("GIVEN a new system role has been set WHEN getting system role THEN return new system role", () => {
  process.env.SYSTEM_ROLE = "system role";
  let defences = getInitialDefences();
  let systemRole = getSystemRole(defences);
  expect(systemRole).toBe("system role");
  defences = configureDefence("SYSTEM_ROLE", defences, [
    { id: "systemRole", value: "new system role" },
  ]);
  systemRole = getSystemRole(defences);
  expect(systemRole).toBe("new system role");
});

test("GIVEN setting email whitelist WHEN configuring defence THEN defence is configured", () => {
  const defence = "EMAIL_WHITELIST";
  const defences = getInitialDefences();
  // configure EMAIL_WHITELIST defence
  configureDefence(defence, defences, [
    {
      id: "whitelist",
      value: "someone@example.com,someone_else@example.com",
    },
  ]);
  const config = [
    { id: "whitelist", value: "someone@example.com,someone_else@example.com" },
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
  const defence = "RANDOM_SEQUENCE_ENCLOSURE";
  let defences = getInitialDefences();
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
