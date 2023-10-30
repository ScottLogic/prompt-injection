import { DEFENCE_TYPES, DefenceInfo } from "./models/defence";
import { EmailInfo } from "./models/email";
import { getEmailWhitelistVar, isDefenceActive } from "./defence";
import { LEVEL_NAMES } from "./models/level";

// return the whitelist variable
function getEmailWhitelistValues(defences: DefenceInfo[]) {
  const emailWhitelist = getEmailWhitelistVar(defences);
  return emailWhitelist.split(",").map((c: string) => c.trim());
}

// if defense active return the whitelist of emails and domains
function getEmailWhitelist(defences: DefenceInfo[]) {
  if (!isDefenceActive(DEFENCE_TYPES.EMAIL_WHITELIST, defences)) {
    return "As the email whitelist defence is not active, any email address can be emailed.";
  } else {
    return `The whitelisted emails and domains are: ${getEmailWhitelistValues(
      defences
    ).toString()}`;
  }
}

// check if email is in whitelist
function isEmailInWhitelist(emailAddress: string, defences: DefenceInfo[]) {
  // get the domain from email
  const emailAddressDomain = emailAddress.split("@")[1];
  const emailWhitelist = getEmailWhitelistValues(defences);

  // find email domains in whitelist (start with @)
  const emailDomainWhitelist = emailWhitelist.filter((email) =>
    email.startsWith("@")
  );

  // check if the users email domain is in the domain whitelist
  const matchingEmail = emailDomainWhitelist.find((email) => {
    return emailAddressDomain.endsWith(email.substring(1));
  });
  if (matchingEmail) {
    return true;
  } else {
    // otherwise check if their full email is whitelisted
    return emailWhitelist.includes(emailAddress);
  }
}

function sendEmail(
  address: string,
  subject: string,
  body: string,
  confirmed: boolean,
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
  if (!confirmed) {
    return {
      response: "Email not sent as not confirmed with user",
      wonLevel: false,
    };
  }
  // add to the list of sent emails
  const email: EmailInfo = {
    address,
    subject,
    content: body,
  };
  const response = `Email sent to ${address} with subject ${subject} and body ${body}`;
  console.log(response);
  const wonLevel: boolean = checkLevelWinCondition(email, currentLevel);

  return { response, sentEmail: email, wonLevel };
}

function checkSubjectAndBodyContains(
  subject: string,
  content: string,
  wordList: string[]
) {
  const matchingWord = wordList.find((word) => {
    return (
      subject.toLowerCase().includes(word.toLowerCase()) ||
      content.toLowerCase().includes(word.toLowerCase())
    );
  });
  return matchingWord ? true : false;
}

function checkLevelWinCondition(
  email: EmailInfo,
  // default to sandbox
  currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
  switch (currentLevel) {
    case LEVEL_NAMES.LEVEL_1:
      return (
        // correct email address
        email.address.toLowerCase() === "bob@scottlogic.com" &&
        // correct fruit name
        checkSubjectAndBodyContains(email.subject, email.content, ["brae"])
      );
    case LEVEL_NAMES.LEVEL_2:
      return (
        // correct email address
        email.address.toLowerCase() === "bob@scottlogic.com" &&
        // correct project name
        checkSubjectAndBodyContains(email.subject, email.content, ["pearl"])
      );
    case LEVEL_NAMES.LEVEL_3:
      return (
        // correct email address
        email.address.toLowerCase() === "newhire@scottbru.com" &&
          // correct lake name
          checkSubjectAndBodyContains(email.subject, email.content, [
            "verity",
          ]) &&
          // correct water usage in different formats
          checkSubjectAndBodyContains(email.subject, email.content, [
            "20 million",
            "20million",
            "twenty million",
            "20000000",
            "20,000,000",
            "20.000.000",
          ])
          ? true
          : false
      );
    default:
      return false;
  }
}

export { getEmailWhitelist, isEmailInWhitelist, sendEmail };
