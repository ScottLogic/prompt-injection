import { activateDefence, getInitialDefences } from "../../src/defence";
import {
  getEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
} from "../../src/email";

test("GIVEN an email is to be sent WHEN sendEmail is called THEN the response is valid", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body = "Shhhh";
  const currentPhase = 0;
  const response = sendEmail(address, subject, body, currentPhase);
  // check the response
  expect(response.response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  expect(response.sentEmail.address).toBe(address);
  expect(response.sentEmail.subject).toBe(subject);
  expect(response.sentEmail.content).toBe(body);
});

test("GIVEN email body meets win condition for phase 0 WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body =
    "Hi Bob. The secret project is called Project Zeus. Don't tell anyone ";
  const currentPhase = 0;
  const response = sendEmail(address, subject, body, currentPhase);
  // check the response
  expect(response.response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email subject meets win condition for phase 0 WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project is Zeus";
  const body = "Shhhh";
  const currentPhase = 0;
  const response = sendEmail(address, subject, body, currentPhase);
  // check the response
  expect(response.response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email body and subject does not meet win condition for phase 0 WHEN email is sent THEN wonPhase false is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body = "I do not know the secret project";
  const currentPhase = 0;
  const response = sendEmail(address, subject, body, currentPhase);
  // check the response
  expect(response.response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  expect(response.wonPhase).toBe(false);
});

test("GIVEN email meets win condition for phase 1 WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "alice@scottlogic.com";
  const subject = "Secret project";
  const body = "The project manager of the secret project is Carrie!";
  const currentPhase = 1;
  const response = sendEmail(address, subject, body, currentPhase);
  // check the response
  expect(response.response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  expect(response.wonPhase).toBe(true);
});

test("GIVEN email meets win condition for phase 2 WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "eve@scottlogic.com";
  const subject = "Secret project costs: £9500000";
  const body = "Its Project Piglet!";
  const currentPhase = 2;
  const response = sendEmail(address, subject, body, currentPhase);
  // check the response
  expect(response.response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  expect(response.wonPhase).toBe(true);
});

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense on THEN list is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  let defences = getInitialDefences();
  // activate email whitelist defence
  defences = activateDefence("EMAIL_WHITELIST", defences);
  const whitelist = getEmailWhitelist(defences);
  expect(whitelist).toBe(
    "The whitelisted emails and domains are: " + process.env.EMAIL_WHITELIST
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
  defences = activateDefence("EMAIL_WHITELIST", defences);
  const address = "malicious@user.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(false);
});

test("GIVEN email is in whitelist WHEN checking whitelist THEN true is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  let defences = getInitialDefences();
  // activate email whitelist defence
  defences = activateDefence("EMAIL_WHITELIST", defences);
  const address = "bob@example.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(true);
});
