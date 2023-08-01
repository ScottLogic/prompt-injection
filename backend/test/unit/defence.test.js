const {
  activateDefence,
  deactivateDefence,
  configureDefence,
  isDefenceActive,
  transformMessage,
  detectTriggeredDefences,
} = require("../../src/defence");

test("GIVEN defence is not active WHEN activating defence THEN defence is active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = [{ id: defence, isActive: false }];
  const updatedActiveDefences = activateDefence(defence, defences);
  expect(updatedActiveDefences).toContainEqual({ id: defence, isActive: true });
});

test("GIVEN defence is active WHEN activating defence THEN defence is active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = [{ id: defence, isActive: true }];
  const updatedActiveDefences = activateDefence(defence, defences);
  expect(updatedActiveDefences).toContainEqual({ id: defence, isActive: true });
});

test("GIVEN defence is active WHEN deactivating defence THEN defence is not active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = [{ id: defence, isActive: true }];
  const updatedActiveDefences = deactivateDefence(defence, defences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is not active WHEN deactivating defence THEN defence is not active", () => {
  const defence = "SYSTEM_ROLE";
  const defences = [{ id: defence, isActive: false }];
  const updatedActiveDefences = deactivateDefence(defence, defences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is active WHEN checking if defence is active THEN return true", () => {
  const defence = "SYSTEM_ROLE";
  const defences = [{ id: defence, isActive: true }];
  const isActive = isDefenceActive(defence, defences);
  expect(isActive).toBe(true);
});

test("GIVEN defence is not active WHEN checking if defence is active THEN return false", () => {
  const defence = "SYSTEM_ROLE";
  const defences = [{ id: defence, isActive: false }];
  const isActive = isDefenceActive(defence, defences);
  expect(isActive).toBe(false);
});

test("GIVEN no defences are active WHEN transforming message THEN message is not transformed", () => {
  const message = "Hello";
  const defences = [];
  const transformedMessage = transformMessage(message, defences);
  expect(transformedMessage).toBe(message);
});

test("GIVEN RANDOM_SEQUENCE_ENCLOSURE defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  const defences = [{ id: "RANDOM_SEQUENCE_ENCLOSURE", isActive: true }];
  // set RSE prompt
  process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT = "RSE_PRE_PROMPT ";
  // set RSE length
  process.env.RANDOM_SEQ_ENCLOSURE_LENGTH = 20;
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
  // expect there to be 3 groups
  expect(res.length).toBe(3);
  // expect the random sequence to have the correct length
  expect(res[1].length).toBe(Number(process.env.RANDOM_SEQ_ENCLOSURE_LENGTH));
  // expect the message to be surrounded by the random sequence
  expect(res[1]).toBe(res[2]);
});

test("GIVEN XML_TAGGING defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  const defences = [{ id: "XML_TAGGING", isActive: true }];
  const transformedMessage = transformMessage(message, defences);
  // expect the message to be surrounded by XML tags
  expect(transformedMessage).toBe("<user_input>" + message + "</user_input>");
});

test("GIVEN no defences are active WHEN detecting triggered defences THEN no defences are triggered", () => {
  const message = "Hello";
  const defences = [];
  const { reply, defenceInfo } = detectTriggeredDefences(message, defences);
  expect(reply).toBe(null);
  expect(defenceInfo.blocked).toBe(false);
  expect(defenceInfo.triggeredDefences.length).toBe(0);
});

test(
  "GIVEN CHARACTER_LIMIT defence is active AND message is too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is triggered AND the message is blocked",
  () => {
    const message = "Hello";
    const defences = [
      {
        id: "CHARACTER_LIMIT",
        isActive: true,
        configuration: [
          {
            id: "maxMessageLength",
            value: 3,
          },
        ],
      },
    ];
    const { reply, defenceInfo } = detectTriggeredDefences(message, defences);
    expect(reply).toBe("Message is too long");
    expect(defenceInfo.blocked).toBe(true);
    expect(defenceInfo.triggeredDefences).toContain("CHARACTER_LIMIT");
  }
);

test(
  "GIVEN CHARACTER_LIMIT defence is active AND message is not too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is not triggered AND the message is not blocked",
  () => {
    const message = "Hello";
    const defences = [
      {
        id: "CHARACTER_LIMIT",
        isActive: true,
        configuration: [
          {
            id: "maxMessageLength",
            value: 280,
          },
        ],
      },
    ];
    const { reply, defenceInfo } = detectTriggeredDefences(message, defences);
    expect(reply).toBe(null);
    expect(defenceInfo.blocked).toBe(false);
    expect(defenceInfo.triggeredDefences.length).toBe(0);
  }
);

test(
  "GIVEN CHARACTER_LIMIT defence is not active AND message is too long " +
    "WHEN detecting triggered defences " +
    "THEN CHARACTER_LIMIT defence is triggered AND the message is not blocked",
  () => {
    const message = "Hello";
    const defences = [
      {
        id: "CHARACTER_LIMIT",
        isActive: false,
        configuration: [
          {
            id: "maxMessageLength",
            value: 3,
          },
        ],
      },
    ];
    const { reply, defenceInfo } = detectTriggeredDefences(message, defences);
    expect(reply).toBe(null);
    expect(defenceInfo.blocked).toBe(false);
    expect(defenceInfo.triggeredDefences).toContain("CHARACTER_LIMIT");
  }
);

test("GIVEN message contains XML tags WHEN detecting triggered defences THEN XML_TAGGING defence is triggered", () => {
  const message = "<Hello>";
  const defences = [];
  const { reply, defenceInfo } = detectTriggeredDefences(message, defences);
  expect(reply).toBe(null);
  expect(defenceInfo.blocked).toBe(false);
  expect(defenceInfo.triggeredDefences).toContain("XML_TAGGING");
});

test("GIVEN setting max message length WHEN configuring defence THEN defence is configured", () => {
  const defence = "CHARACTER_LIMIT";
  const defences = [
    {
      id: defence,
      isActive: true,
      configuration: [{ id: "maxMessageLength", value: 20 }],
    },
  ];
  const configuration = [{ id: "maxMessageLength", value: 10 }];
  const updatedDefences = configureDefence(defence, defences, configuration);
  expect(updatedDefences).toContainEqual({
    id: defence,
    isActive: true,
    configuration: configuration,
  });
});


test("GIVEN setting email whitelist WHEN configuring defence THEN defence is configured", () => {
  const defence = "EMAIL_WHITELIST";
  const defences = [
    {
      id: defence,
      isActive: true,
      configuration: [{ id: "whitelist", value: "someone@example.com,someone_else@example.com" }],
    }]

    const configuration = [{ id: "whitelist", value: "someone@example.com,someone_else@example.com" }];
    const updatedDefences = configureDefence(defence, defences, configuration);
    expect(updatedDefences).toContainEqual({
      id: defence,
      isActive: true,
      configuration: configuration,
    });
  });
