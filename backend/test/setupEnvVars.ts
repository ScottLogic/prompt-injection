// set the environment variables
process.env.OPENAI_API_KEY = "sk-12345";
process.env.XML_TAGGING_PRE_PROMPT = "XML_PRE_PROMPT: ";
process.env.MAX_MESSAGE_LENGTH = String(280);
process.env.FILTER_LIST_INPUT = "password,salary info,";
process.env.FILTER_LIST_OUTPUT = "secret project,password";
