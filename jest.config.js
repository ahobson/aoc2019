module.exports = {
  preset: "ts-jest",
  rootDir: "src",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.build/"],
  globals: {
    "ts-jest": {
      packageJson: "package.json"
    }
  }
};
