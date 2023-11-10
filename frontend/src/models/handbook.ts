enum HANDBOOK_PAGES {
  ATTACKS,
  SYSTEM_ROLE,
  GLOSSARY,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
  [HANDBOOK_PAGES.SYSTEM_ROLE]: "System Role",
  [HANDBOOK_PAGES.GLOSSARY]: "Glossary",
};

export { HANDBOOK_PAGES, handbookPageNames };
