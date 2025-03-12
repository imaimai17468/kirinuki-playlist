module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.(j|t)sx?$": "esbuild-jest",
  },
  moduleNameMapper: {
    "jsonpath-plus":
      "<rootDir>/node_modules/jsonpath-plus/dist/index-node-cjs.cjs",
  },
  transformIgnorePatterns: ["node_modules/(?!nanoid/)"],
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
};
