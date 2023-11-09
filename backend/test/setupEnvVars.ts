// set the environment variables
process.env.OPENAI_API_KEY = "sk-12345";
process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT = "RSE_PRE_PROMPT ";
process.env.RANDOM_SEQ_ENCLOSURE_LENGTH = String(20);
process.env.EMAIL_WHITELIST =
  "bob@example.com,kate@example.com,@anotherExample.com";
