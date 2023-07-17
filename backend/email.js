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

module.exports = { clearEmails, getSentEmails, sendEmail };
