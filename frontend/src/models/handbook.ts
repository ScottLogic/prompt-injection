enum HANDBOOK_PAGES {
  ATTACKS,
  GLOSSARY,
  SYSTEM_ROLE,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
  [HANDBOOK_PAGES.GLOSSARY]: "Glossary",
  [HANDBOOK_PAGES.SYSTEM_ROLE]: "System Role",
};

export { HANDBOOK_PAGES, handbookPageNames };
