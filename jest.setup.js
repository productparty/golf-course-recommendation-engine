require('@testing-library/jest-dom');
require('dotenv').config();

// Add any global configurations or setups for Jest here

// For example, extend Jest with additional matchers:
// const jestExtended = require('jest-extended');
// expect.extend(jestExtended);

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
