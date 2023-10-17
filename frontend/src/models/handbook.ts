enum HANDBOOK_PAGES {
  MISSION_INFO,
  ATTACKS,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.MISSION_INFO]: "Mission",
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
};

export { HANDBOOK_PAGES, handbookPageNames };
