const sentEmails = [];

function clearEmails() {
  sentEmails.length = 0;
}

function getSentEmails() {
  return sentEmails;
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
function getEmailWhitelist(returnAll){
  const emailWhitelist = process.env.EMAIL_WHITELIST.split(",");
  const emailDomainWhitelist = emailWhitelist.filter(email => email.startsWith("@"));
  if (returnAll){
    return "Whitelisted emails and domains are: " + emailWhitelist;
  } 
  return "Whitelisted domains are: " + emailDomainWhitelist;
}

module.exports = { clearEmails, getSentEmails, sendEmail, getEmailWhitelist };
