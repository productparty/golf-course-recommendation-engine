// Import the text-encoding polyfill
import { TextEncoder, TextDecoder } from 'text-encoding';

// Assign the polyfill to the global object
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
