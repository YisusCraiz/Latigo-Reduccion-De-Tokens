const { optimize } = require('../engine.js');
const { countTokens, metadata } = require('./tokenizer.cjs');
const MAX_LENGTH = 200000;
function analyze(text, options = {}) {
  if (typeof text !== 'string') throw new TypeError('El contexto debe ser texto.');
  if (text.length > MAX_LENGTH) throw new RangeError('El límite es de 200.000 caracteres.');
  const candidate = optimize(text, options);
  const before = countTokens(text);
  const candidateAfter = candidate.text === text ? before : countTokens(candidate.text);
  const accepted = candidateAfter < before;
  const decision = candidate.text === text ? 'unchanged' : accepted ? 'accepted' : 'no-token-benefit';
  const after = accepted ? candidateAfter : before;
  return {
    text: accepted ? candidate.text : text,
    changes: accepted ? candidate.changes : [],
    proposedChanges: candidate.changes.length,
    before, after, candidateAfter, savedTokens: before - after,
    savedPercent: before ? 100 * (before - after) / before : 0,
    savedCharacters: accepted ? candidate.savedCharacters : 0,
    decision, tokenizer: metadata
  };
}
module.exports = { analyze, MAX_LENGTH };
