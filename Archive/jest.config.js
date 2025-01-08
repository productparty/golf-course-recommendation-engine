module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setupTests.js'],
  testPathIgnorePatterns: ['<rootDir>/golf-club-ui/'],
  // Add moduleDirectories to help Jest resolve modules correctly
  moduleDirectories: ['node_modules', 'src'],
  // Add moduleNameMapper to handle module aliases if any
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Add transform to handle JavaScript and TypeScript files
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest', // Handle ES modules
  },
  transformIgnorePatterns: [
    '/node_modules/(?!your-module-that-needs-to-be-transformed)', // Adjust this pattern as needed
  ],
};
