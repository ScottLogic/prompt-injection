enum HANDBOOK_PAGES {
  ATTACKS,
  GLOSSARY,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
  [HANDBOOK_PAGES.GLOSSARY]: "Glossary",
};

export { HANDBOOK_PAGES, handbookPageNames };
