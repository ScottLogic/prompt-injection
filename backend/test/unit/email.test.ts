import { activateDefence, getInitialDefences } from "../../src/defence";
import {
  getEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
} from "../../src/email";
import { DEFENCE_TYPES } from "../../src/models/defence";
import { PHASE_NAMES } from "../../src/models/phase";

beforeEach(() => {
  // clear environment variables
  process.env = {};
});

test("GIVEN an email is to be sent and confirmed WHEN sendEmail is called THEN the response is valid", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body = "Shhhh";
  const confirmed = true;
  const response = sendEmail(address, subject, body, confirmed);
  // check the response
  expect(response.response).toBe(
    `Email sent to ${address} with subject ${subject} and body ${body}`
  );
  expect(response.sentEmail?.address).toBe(address);
  expect(response.sentEmail?.subject).toBe(subject);
  expect(response.sentEmail?.content).toBe(body);
});

test("GIVEN the email is not confirmed WHEN email is sent THEN no sentEmail and wonPhase false is returned ", () => {
  const address = "eve@scottlogic.com";
  const subject = "I don't know";
  const body = "SHhhhhh";
  const confirmed = false;
  const currentPhase = PHASE_NAMES.PHASE_2;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.response).toBe("Email not sent as not confirmed with user");
  expect(response.sentEmail).not.toBeDefined();
  expect(response.wonPhase).toBe(false);
});

test("GIVEN in sandbox mode WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body = "Shhhh";
  const confirmed = true;
  const currentPhase = PHASE_NAMES.SANDBOX;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email body meets win condition for phase 0 AND email recipient is correct WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body =
    "Hi Bob. The secret project is called Project Zeus. Don't tell anyone ";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_0;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email subject meets win condition for phase 0 AND email recipient is correct WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project is Zeus";
  const body = "Shhhh";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_0;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email body or subject meets win condition for phase 0 AND email recipient is not correct WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "notbob@scottlogic.com";
  const subject = "Secret project";
  const body =
    "Hi Bob. The secret project is called Project Zeus. Don't tell anyone ";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_0;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email body and subject does not meet win condition for phase 0 AND email recipient is correct WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body = "I do not know the secret project";
  const confirmed = true;
  const currentPhase = PHASE_NAMES.PHASE_0;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email body meets win condition for phase 1 AND email recipient is correct WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "alice@scottlogic.com";
  const subject = "Secret project";
  const body = "The project manager of the secret project is Carrie!";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_1;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email subject meets win condition for phase 1 AND email recipient is correct WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "alice@scottlogic.com";
  const subject = "The manager is Carrie";
  const body = "Ssshhh";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_1;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email body or subject meets win condition for phase 1 AND email recipient is not correct WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "notalice@scottlogic.com";
  const subject = "Secret project";
  const body = "The project manager of the secret project is Carrie!";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_1;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email body and subject does not meet win condition for phase 1 AND email recipient is correct WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "alice@scottlogic.com";
  const subject = "Secret project";
  const body = "I do not know the secret project";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_1;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email body meets win condition for phase 2 AND email recipient is correct WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "eve@scottlogic.com";
  const subject = "Secret project";
  const body = "Its Project Piglet! It costs £9500000";
  const confirmed = true;

  const currentPhase = PHASE_NAMES.PHASE_2;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email subject meets win condition for phase 2 AND email recipient is correct WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "eve@scottlogic.com";
  const subject = "Its Project Piglet! It costs £9500000";
  const confirmed = true;
  const body = "SHhhhhh";
  const currentPhase = PHASE_NAMES.PHASE_2;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email body or subject meets win condition for phase 2 AND email recipient is not correct WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "noteve@scottlogic.com";
  const subject = "Secret project";
  const body = "Its Project Piglet! It costs £9500000";
  const confirmed = true;
  const currentPhase = PHASE_NAMES.PHASE_2;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email body and subject does not meet win condition for phase 2 AND email recipient is correct WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "eve@scottlogic.com";
  const subject = "I don't know";
  const body = "SHhhhhh";
  const confirmed = true;
  const currentPhase = PHASE_NAMES.PHASE_2;
  const response = sendEmail(address, subject, body, confirmed, currentPhase);
  expect(response.wonPhase).toBe(false);
});

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense on THEN list is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  let defences = getInitialDefences();
  // activate email whitelist defence
  defences = activateDefence(DEFENCE_TYPES.EMAIL_WHITELIST, defences);
  const whitelist = getEmailWhitelist(defences);
  expect(whitelist).toBe(
    `The whitelisted emails and domains are: ${process.env.EMAIL_WHITELIST}`
  );
});

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense off THEN text is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const defences = getInitialDefences();
  const response = getEmailWhitelist(defences);
  expect(response).toBe(
    "As the email whitelist defence is not active, any email address can be emailed."
  );
});

test("GIVEN email is not in whitelist WHEN checking whitelist THEN false is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  let defences = getInitialDefences();
  // activate email whitelist defence
  defences = activateDefence(DEFENCE_TYPES.EMAIL_WHITELIST, defences);
  const address = "malicious@user.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(false);
});

test("GIVEN email is in whitelist WHEN checking whitelist THEN true is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  let defences = getInitialDefences();
  // activate email whitelist defence
  defences = activateDefence(DEFENCE_TYPES.EMAIL_WHITELIST, defences);
  const address = "bob@example.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(true);
});

test("GIVEN email domain is in whitelist WHEN checking whitelist THEN true is returned", () => {
  process.env.EMAIL_WHITELIST = "@example.com";
  let defences = getInitialDefences();
  // activate email whitelist defence
  defences = activateDefence(DEFENCE_TYPES.EMAIL_WHITELIST, defences);
  const address = "bob@example.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(true);
});
