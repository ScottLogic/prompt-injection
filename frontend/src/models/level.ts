enum LEVEL_NAMES {
  LEVEL_1 = 0,
  LEVEL_2,
  LEVEL_3,
  SANDBOX,
}

interface Level {
  id: LEVEL_NAMES;
  name: string;
  preamble: string;
}

export { LEVEL_NAMES };
export type { Level };
