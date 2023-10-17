enum HANDBOOK_PAGES {
  ATTACKS,
}

const handbookPageNames: { [key in HANDBOOK_PAGES]: string } = {
  [HANDBOOK_PAGES.ATTACKS]: "Attacks",
};

export { HANDBOOK_PAGES, handbookPageNames };
