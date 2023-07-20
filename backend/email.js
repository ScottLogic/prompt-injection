const sentEmails = [];

function clearEmails() {
  sentEmails.length = 0;
}

function getSentEmails() {
  return sentEmails;
}

// check if email is in whitelist
function isEmailInWhitelist(emailAddress) {
  // get the domain from email
  const emailAddressDomain = emailAddress.split("@")[1];
  const emailWhitelist = process.env.EMAIL_WHITELIST.split(",");
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

function sendEmail(email, subject, message) {
  // add to the list of sent emails
  sentEmails.push({ address: email, subject: subject, content: message });
  response =
    "Sending email to " +
    email +
    " with subject " +
    subject +
    " and message " +
    message;
  console.log(response);
  return response;
}

// return the whitelist of emails and domains, or domains only
function getEmailWhitelist() {
  const emailWhitelist = process.env.EMAIL_WHITELIST.split(",");
  return "Whitelisted emails and domains are: " + emailWhitelist;
}

module.exports = {
  clearEmails,
  getSentEmails,
  isEmailInWhitelist,
  sendEmail,
  getEmailWhitelist,
};
