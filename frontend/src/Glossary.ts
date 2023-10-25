interface GlossaryEntry {
  term: string;
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: "System Role",
    definition: `A System Role is an initial set of instructions/prompts that the chatbot will follow and
    define how the chatbot interacts with users. Any prompts you ask it are added on top of
    the System Role. Look at the Attacks section to learn how this security measure can be
    circumvented.`,
  },
  {
    term: "Prompt",
    definition: `A prompt is a bit of text that fed as the input into into a chatbot.
    It can be any string but is usually a question, instruciton or statement written in human language.
    The chatbot will use the prompt alongside the conversation history and the System Role to generate a response.`,
  },
];

export { GLOSSARY };
