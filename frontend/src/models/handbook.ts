enum HANDBOOK_PAGES {
  MISSION_INFO,
  ATTACKS,
  TOOLS,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.MISSION_INFO]: "Mission",
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
  [HANDBOOK_PAGES.TOOLS]: "Tools",
};

export { HANDBOOK_PAGES, handbookPageNames };
