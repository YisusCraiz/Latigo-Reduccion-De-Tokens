const { Tiktoken } = require('js-tiktoken/lite');
const ranks = require('js-tiktoken/ranks/cl100k_base');
const metadata = Object.freeze({ encoding: 'cl100k_base', library: 'js-tiktoken', version: '1.0.21', specialTokens: 'ordinary-text' });
let encoder;
function countTokens(text) {
  if (typeof text !== 'string') throw new TypeError('El contexto debe ser texto.');
  encoder ||= new Tiktoken(ranks);
  // User-entered special-token spellings are ordinary text, never control tokens.
  return encoder.encode(text, [], []).length;
}
module.exports = { countTokens, metadata };
