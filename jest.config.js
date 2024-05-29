module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'], // Specify the directory where your test files are located
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  //testRegex: '.*\\.test\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: false, // Enable code coverage
  moduleNameMapper: {
    '^/opt/(.*)$': '<rootDir>/lambda-layer/$1',
  },
  verbose: true,
};
