interface GlossaryEntry {
  term: string;
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Large Language Model (LLM)",
    definition: `A Large Language Model (LLM) is a form of AI for generating, predicting and responding to text in
    human language. These models are hugely complex and are trained on massive datasets of human language. The chatbot
    you are talking to right now has an LLM behind the scenes!`,
  },
  {
    term: "Prompt",
    definition: `A prompt is a bit of text that fed as the input into into a chatbot.
    It can be any string but is usually a question, instruciton or statement written in human language.
    The chatbot will use the prompt alongside the conversation history and the System Role to generate a response.`,
  },
  {
    term: "Prompt Injection",
    definition: `Prompt Injection is a type of attack where a malicious user will use prompts
    to get past an LLM's security measures, perform unauthorised actions, make the bot behave in unintended ways and
    generally exploit the system.`,
  },
  {
    term: "System Role",
    definition: `A System Role is an initial set of instructions/prompts that the chatbot will follow and
    define how the chatbot interacts with users. Any prompts you ask it are added on top of
    the System Role. Look at the Attacks section to learn how this security measure can be
    circumvented.`,
  },
];

export { GLOSSARY };
