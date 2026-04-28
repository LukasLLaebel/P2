export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    '!node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.test.js']
};

