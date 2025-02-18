module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.text.ts?(x)', '**/?(*.)+(spec|test).js?(x)'],
  displayName: { name: 'SampleTestSuite', color: 'blue' },
  collectCoverage: true,
  reporters: ['default'],
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/modules/',
    '<rootDir>/_tests_/common'
  ],
  testEnvironment: 'jsdom'
};
