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
];

export { GLOSSARY };
