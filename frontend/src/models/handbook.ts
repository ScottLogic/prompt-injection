enum HANDBOOK_PAGES {
  MISSION_INFO,
  ATTACKS,
  GLOSSARY,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.MISSION_INFO]: "Mission",
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
  [HANDBOOK_PAGES.GLOSSARY]: "Glossary",
};

export { HANDBOOK_PAGES, handbookPageNames };
