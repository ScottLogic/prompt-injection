function sendEmail(email, subject, message) {
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

module.exports = { sendEmail };
