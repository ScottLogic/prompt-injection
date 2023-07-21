const {
  activateDefence,
  deactivateDefence,
  isDefenceActive,
  transformMessage,
  detectTriggeredDefences,
} = require("../src/defence");

test("GIVEN defence is not active WHEN activating defence THEN defence is active", () => {
  const defence = "SYSTEM_ROLE";
  const activeDefences = [];
  const updatedActiveDefences = activateDefence(defence, activeDefences);
  expect(updatedActiveDefences).toContain(defence);
});

test("GIVEN defence is active WHEN activating defence THEN defence is active", () => {
  const defence = "SYSTEM_ROLE";
  const activeDefences = [defence];
  const updatedActiveDefences = activateDefence(defence, activeDefences);
  expect(updatedActiveDefences).toContain(defence);
});

test("GIVEN defence is active WHEN deactivating defence THEN defence is not active", () => {
  const defence = "SYSTEM_ROLE";
  const activeDefences = [defence];
  const updatedActiveDefences = deactivateDefence(defence, activeDefences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is not active WHEN deactivating defence THEN defence is not active", () => {
  const defence = "SYSTEM_ROLE";
  const activeDefences = [];
  const updatedActiveDefences = deactivateDefence(defence, activeDefences);
  expect(updatedActiveDefences).not.toContain(defence);
});

test("GIVEN defence is active WHEN checking if defence is active THEN return true", () => {
  const defence = "SYSTEM_ROLE";
  const activeDefences = [defence];
  const isActive = isDefenceActive(defence, activeDefences);
  expect(isActive).toBe(true);
});

test("GIVEN defence is not active WHEN checking if defence is active THEN return false", () => {
  const defence = "SYSTEM_ROLE";
  const activeDefences = [];
  const isActive = isDefenceActive(defence, activeDefences);
  expect(isActive).toBe(false);
});

test("GIVEN no defences are active WHEN transforming message THEN message is not transformed", () => {
  const message = "Hello";
  const activeDefences = [];
  const transformedMessage = transformMessage(message, activeDefences);
  expect(transformedMessage).toBe(message);
});

test("GIVEN RANDOM_SEQUENCE_ENCLOSURE defence is active WHEN transforming message THEN message is transformed", () => {
  const message = "Hello";
  const activeDefences = ["RANDOM_SEQUENCE_ENCLOSURE"];
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
  const transformedMessage = transformMessage(message, activeDefences);
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
  const activeDefences = ["XML_TAGGING"];
  const transformedMessage = transformMessage(message, activeDefences);
  // expect the message to be surrounded by XML tags
  expect(transformedMessage).toBe("<user_input>" + message + "</user_input>");
});
