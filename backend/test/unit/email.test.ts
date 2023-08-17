import {
  getEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
} from "../../src/email";

test("GIVEN email is ready to be sent WHEN email is sent THEN session list is updated", () => {
  const address = "bob@example.com";
  const subject = "Hello";
  const body = "Hi Bob";
  const currentPhase = 3;
  const session = {
    sentEmails: [],
  };
  const response = sendEmail(address, subject, body, session, currentPhase);
  // check the response
  expect(response.response).toBe(
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

test("GIVEN email body meets win condition for phase 0 WHEN email is sent THEN wonPhase true is returned ", () => {
  const address = "bob@scottlogic.com";
  const subject = "Secret project";
  const body =
    "Hi Bob. The secret project is called Project Zeus. Don't tell anyone ";
  const currentPhase = 0;
  const session = {
    sentEmails: [],
  };
  const response = sendEmail(address, subject, body, session, currentPhase);
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
  const session = {
    sentEmails: [],
  };
  const response = sendEmail(address, subject, body, session, currentPhase);
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
  const subject = "Secret project";
  const body = "I do not know the secret project";
  const currentPhase = 0;
  const session = {
    sentEmails: [],
  };
  const response = sendEmail(address, subject, body, session, currentPhase);
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

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense on THEN list is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const defences = [
    {
      id: "EMAIL_WHITELIST",
      isActive: true,
      config: [
        {
          id: "whitelist",
          value: "bob@example.com,kate@example.com",
        },
      ],
    },
  ];
  const whitelist = getEmailWhitelist(defences);
  expect(whitelist).toBe(
    "The whitelisted emails and domains are: " + process.env.EMAIL_WHITELIST
  );
});

test("GIVEN EMAIL_WHITELIST envionrment variable is set WHEN getting whitelist AND whitelist defense off THEN text is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const defences = [
    {
      id: "EMAIL_WHITELIST",
      isActive: false,
      config: [
        {
          id: "whitelist",
          value: "bob@example.com,kate@example.com",
        },
      ],
    },
  ];
  const response = getEmailWhitelist(defences);
  expect(response).toBe(
    "As the email whitelist defence is not active, any email address can be emailed."
  );
});

test("GIVEN email is not in whitelist WHEN checking whitelist THEN false is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const defences = [
    {
      id: "EMAIL_WHITELIST",
      isActive: true,
      config: [
        {
          id: "whitelist",
          value: "bob@example.com,kate@example.com",
        },
      ],
    },
  ];
  const address = "malicious@user.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(false);
});

test("GIVEN email is in whitelist WHEN checking whitelist THEN true is returned", () => {
  process.env.EMAIL_WHITELIST = "bob@example.com,kate@example.com";
  const defences = [
    {
      id: "EMAIL_WHITELIST",
      isActive: true,
      config: [
        {
          id: "whitelist",
          value: "bob@example.com,kate@example.com",
        },
      ],
    },
  ];
  const address = "bob@example.com";
  const isWhitelisted = isEmailInWhitelist(address, defences);
  expect(isWhitelisted).toBe(true);
});
