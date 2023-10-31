// set the environment variables
process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT = "RSE_PRE_PROMPT ";
process.env.RANDOM_SEQ_ENCLOSURE_LENGTH = String(20);
process.env.XML_TAGGING_PRE_PROMPT = "XML_PRE_PROMPT: ";
process.env.MAX_MESSAGE_LENGTH = String(280);
process.env.EMAIL_WHITELIST =
  "bob@example.com,kate@example.com,@anotherExample.com";
process.env.FILTER_LIST_INPUT = "password,salary info,";
process.env.FILTER_LIST_OUTPUT = "secret project,password";
