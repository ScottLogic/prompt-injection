// return the whitelist of emails and domains, or domains only
function getEmailWhitelist() {
  const emailWhitelist = process.env.EMAIL_WHITELIST.split(",");
  return "Whitelisted emails and domains are: " + emailWhitelist;
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
  const result = {
    isEmailSent: true,
  };
  return JSON.stringify(result);
}

module.exports = {
  getEmailWhitelist,
  isEmailInWhitelist,
  sendEmail,
};
