/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.[jt]s?(x)'],
  // Avoid picking up Playwright specs.
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
};
