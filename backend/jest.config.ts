import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  moduleNameMapper: {
    "^@src/(.*)": "<rootDir>/src/$1",
  },
  modulePathIgnorePatterns: ["build", "coverage", "node_modules"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "test/tsconfig.json",
      },
    ],
  },
  silent: true,
  setupFiles: ["<rootDir>/test/setupEnvVars.ts"],
};

export default jestConfig;
