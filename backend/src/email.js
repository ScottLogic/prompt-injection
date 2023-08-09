const { getEmailWhitelistVar, isDefenceActive } = require("./defence.js");

// return the whitelist variable
function getEmailWhitelistValues(defences) {
  const emailWhitelist = getEmailWhitelistVar(defences);
  return emailWhitelist.split(",").map((c) => c.trim());
}

// if defense active return the whitelist of emails and domains
function askEmailWhitelist(defences) {
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
function isEmailInWhitelist(emailAddress, defences) {
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

function sendEmail(address, subject, body, session) {
  // add to the list of sent emails
  const email = { address: address, subject: subject, content: body };
  const response =
    "Email sent to " +
    address +
    " with subject " +
    subject +
    " and body " +
    body;
  console.log(response);
  // add the sent email to the session
  session.sentEmails.push(email);
  return response;
}

module.exports = {
  askEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
};
