module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1', // Added from root config
  },
  moduleDirectories: ['node_modules', 'src'], // Added from root config
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest', // Handle ES modules
  },
  transformIgnorePatterns: [
    '/node_modules/(?!your-module-that-needs-to-be-transformed)', // Adjust this pattern as needed
  ],
  testEnvironment: 'node', // Added from root config
  testMatch: ['**/tests/**/*.test.js'], // Added from root config
  testPathIgnorePatterns: ['<rootDir>/golf-club-ui/'], // Added from root config
  // ...other Jest configurations...
};
