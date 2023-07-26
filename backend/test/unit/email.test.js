const {
  getEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
} = require("../../src/email");

test("GIVEN email is ready to be sent WHEN email is sent THEN session list is updated", () => {
  const address = "bob@example.com";
  const subject = "Hello";
  const body = "Hi Bob";
  const session = {
    sentEmails: [],
  };
  const response = sendEmail(address, subject, body, session);
  // check the response
  expect(response).toBe(
    "Email sent to " +
      address +
      " with subject " +
      subject +
      " and body " +
      body
  );
  // check the sent email has been added to the session
  expect(session.sentEmails.length).toBe(1);
  expect(session.sentEmails[0].address).toBe(address);
  expect(session.sentEmails[0].subject).toBe(subject);
  expect(session.sentEmails[0].content).toBe(body);
});

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense on THEN list is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const isDefenceActive = true; 
  const whitelist = getEmailWhitelist(isDefenceActive);
  expect(whitelist).toBe("The whitelisted emails and domains are: "+ process.env.EMAIL_WHITELIST);
});

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense off THEN text is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const isDefenceActive = false; 
  const whitelist = getEmailWhitelist(isDefenceActive);
  expect(whitelist).toBe("As the email whitelist defence is not active, any email address can be emailed.");
});

test("GIVEN email is not in whitelist WHEN checking whitelist THEN false is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const address = "malicious@user.com";
  const isWhitelisted = isEmailInWhitelist(address);
  expect(isWhitelisted).toBe(false);
});

test("GIVEN email is in whitelist WHEN checking whitelist THEN true is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const address = "bob@example.com";
  const isWhitelisted = isEmailInWhitelist(address);
  expect(isWhitelisted).toBe(true);
});
