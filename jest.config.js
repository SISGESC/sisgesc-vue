/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.js$': 'babel-jest',
    },
  testPathIgnorePatterns: ['node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 30000,
  setupFilesAfterEnv: ['./src/tests/setup/afterEnv.js', 'expect-puppeteer'],
  globalSetup: './src/tests/setup/index.js',
  testEnvironment: "jest-environment-puppeteer",
  verbose: true,
  maxConcurrency: 1,
  maxWorkers: 1
}
