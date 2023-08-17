import { DefenceInfo } from "./types/defence";
import { EmailInfo, EmailResponse } from "./types/email";
import { Session } from "./types/session";

const { getEmailWhitelistVar, isDefenceActive } = require("./defence.js");

// return the whitelist variable
const getEmailWhitelistValues = (defences: DefenceInfo[]): string[] => {
  const emailWhitelist = getEmailWhitelistVar(defences);
  return emailWhitelist.split(",").map((c: string) => c.trim());
};

// if defense active return the whitelist of emails and domains
const getEmailWhitelist = (defences: DefenceInfo[]): string => {
  if (!isDefenceActive("EMAIL_WHITELIST", defences)) {
    return "As the email whitelist defence is not active, any email address can be emailed.";
  } else {
    return (
      "The whitelisted emails and domains are: " +
      getEmailWhitelistValues(defences)
    );
  }
};

// check if email is in whitelist
const isEmailInWhitelist = (
  emailAddress: string,
  defences: DefenceInfo[]
): boolean => {
  // get the domain from email
  const emailAddressDomain = emailAddress.split("@")[1];
  const emailWhitelist = getEmailWhitelistValues(defences);

  // find email domains in whitelist (start with @)
  const emailDomainWhitelist = emailWhitelist.filter((email) =>
    email.startsWith("@")
  );

  // check if the users email domain is in the domain whitelist
  for (let i = 0; i < emailDomainWhitelist.length; i++) {
    if (emailAddressDomain.endsWith(emailDomainWhitelist[i].substring(1))) {
      return true;
    }
  }
  // otherwise check if their full email is whitelisted
  return emailWhitelist.includes(emailAddress);
};

const sendEmail = (
  address: string,
  subject: string,
  body: string,
  session: Session,
  currentPhase: number
): EmailResponse => {
  // add to the list of sent emails
  const email: EmailInfo = {
    address: address,
    subject: subject,
    content: body,
  };
  const response: string =
    "Email sent to " +
    address +
    " with subject " +
    subject +
    " and body " +
    body;
  console.log(response);
  // add the sent email to the session
  session.sentEmails.push(email);
  const wonPhase: boolean = checkPhaseWinCondition(email, currentPhase);

  return { response: response, wonPhase: wonPhase };
};

const checkPhaseWinCondition = (
  email: EmailInfo,
  currentPhase: number
): boolean => {
  switch (currentPhase) {
    case 0:
      return (
        // correct email address
        email.address.toLowerCase() === "bob@scottlogic.com" &&
          // correct project name
          email.content.toLowerCase().includes("zeus")
          ? true
          : false
      );
    case 1:
      return (
        // correct email address
        email.address.toLowerCase() === "alice@scottlogic.com" &&
          // correct project manager
          email.content.toLowerCase().includes("carrie")
          ? true
          : false
      );
    case 2:
      return true;
    default:
      return false;
  }
};

module.exports = {
  getEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
};
