/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  modulePathIgnorePatterns: ["build", "coverage", "node_modules"],
  preset: "ts-jest",
  testEnvironment: "node",
};
