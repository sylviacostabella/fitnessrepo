module.exports = {
  verbose: true,
  globalSetup: "./tests/setup.js",
  globalTeardown: "./tests/tearDown.js",
  collectCoverage: false,
  forceExit: true,
  testMatch: [
    "**/tests/**/*.spec.js"
  ],
};
