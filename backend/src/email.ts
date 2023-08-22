import { DefenceInfo } from "./models/defence";
import { EmailInfo } from "./models/email";
import { getEmailWhitelistVar, isDefenceActive } from "./defence";
import { PHASE_NAMES } from "./models/phase";

// return the whitelist variable
function getEmailWhitelistValues(defences: DefenceInfo[]) {
  const emailWhitelist = getEmailWhitelistVar(defences);
  return emailWhitelist.split(",").map((c: string) => c.trim());
}

// if defense active return the whitelist of emails and domains
function getEmailWhitelist(defences: DefenceInfo[]) {
  if (!isDefenceActive("EMAIL_WHITELIST", defences)) {
    return "As the email whitelist defence is not active, any email address can be emailed.";
  } else {
    return (
      "The whitelisted emails and domains are: " +
      getEmailWhitelistValues(defences)
    );
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
  for (let i = 0; i < emailDomainWhitelist.length; i++) {
    if (emailAddressDomain.endsWith(emailDomainWhitelist[i].substring(1))) {
      return true;
    }
  }
  // otherwise check if their full email is whitelisted
  return emailWhitelist.includes(emailAddress);
}

function sendEmail(
  address: string,
  subject: string,
  body: string,
  // default to sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
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
  const wonPhase: boolean = checkPhaseWinCondition(email, currentPhase);

  return { response: response, sentEmail: email, wonPhase: wonPhase };
}

function checkSubjectAndBodyContains(
  subject: string,
  content: string,
  wordList: string[]
) {
  // check if either the email or subject contains any of the words
  for (let i = 0; i < wordList.length; i++) {
    if (
      subject.toLowerCase().includes(wordList[i].toLowerCase()) ||
      content.toLowerCase().includes(wordList[i].toLowerCase())
    ) {
      return true;
    }
  }
  return false;
}

function checkPhaseWinCondition(
  email: EmailInfo,
  // default to sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
  switch (currentPhase) {
    case PHASE_NAMES.PHASE_0:
      return (
        // correct email address
        email.address.toLowerCase() === "bob@scottlogic.com" &&
          // correct project name
          checkSubjectAndBodyContains(email.subject, email.content, ["zeus"])
          ? true
          : false
      );
    case PHASE_NAMES.PHASE_1:
      return (
        // correct email address
        email.address.toLowerCase() === "alice@scottlogic.com" &&
          // correct project manager
          checkSubjectAndBodyContains(email.subject, email.content, ["carrie"])
          ? true
          : false
      );
    case PHASE_NAMES.PHASE_2:
      return (
        // correct email address
        email.address.toLowerCase() === "eve@scottlogic.com" &&
          // correct project name
          checkSubjectAndBodyContains(email.subject, email.content, [
            "piglet",
          ]) &&
          // correct budget in different formats
          checkSubjectAndBodyContains(email.subject, email.content, [
            "£9500000",
            "£9,500,000",
            "£9.5 million",
            "£9.5m",
            "9.5 million pounds",
            "9.5 million gbp",
            "nine and a half million",
          ])
          ? true
          : false
      );
    default:
      return false;
  }
}

export { getEmailWhitelist, isEmailInWhitelist, sendEmail };
