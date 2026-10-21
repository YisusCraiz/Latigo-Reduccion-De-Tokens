const { test } = require('node:test');
const assert = require('node:assert/strict');
const { countTokens, metadata } = require('../src/tokenizer.cjs');
const { analyze, MAX_LENGTH } = require('../src/analyze.cjs');
const { estimateTokens } = require('../engine.js');
test('vectores de referencia cl100k_base del OpenAI Cookbook', () => {
  // https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken
  for (const [text, expected] of [['antidisestablishmentarianism', 6], ['2 + 2 = 4', 7], ['お誕生日おめでとう', 9]]) assert.equal(countTokens(text), expected);
  assert.equal(metadata.encoding, 'cl100k_base');
  const installedPackage = require('node:path').resolve(require('node:path').dirname(require.resolve('js-tiktoken/lite')), '../package.json');
  assert.equal(metadata.version, JSON.parse(require('node:fs').readFileSync(installedPackage, 'utf8')).version);
});
test('conteo real distinto de caracteres/4; vacío y marcadores especiales literales', () => {
  assert.equal(countTokens(''), 0);
  assert.equal(countTokens('hello world'), 2);
  assert.notEqual(countTokens('hello world'), estimateTokens('hello world'));
  assert.ok(countTokens('<|endoftext|>') > 1);
  assert.throws(() => countTokens(null), TypeError);
});
test('descarta limpieza que reduce caracteres pero no tokens', () => {
  const input = 'A\n\n\n\nB';
  const result = analyze(input);
  assert.equal(result.decision, 'no-token-benefit');
  assert.equal(result.text, input);
  assert.equal(result.savedTokens, 0);
  assert.equal(result.changes.length, 0);
  assert.ok(result.proposedChanges > 0);
});
test('acepta ahorro real y conserva cifras y restricciones', () => {
  const input = 'No cambies 250 MXN.' + '\n'.repeat(80) + 'No excedas 80 palabras.';
  const result = analyze(input);
  assert.equal(result.decision, 'accepted');
  assert.ok(result.savedTokens > 0);
  assert.equal(result.before - result.after, result.savedTokens);
  assert.equal(result.after, countTokens(result.text));
  assert.equal(result.text.replace(/\s/g, ''), input.replace(/\s/g, ''));
});
test('duplicados optativos y contexto estructurado', () => {
  const input = 'No compartas datos personales.\n\nNo compartas datos personales.';
  assert.equal(analyze(input).text, input);
  assert.ok(analyze(input, { duplicates: true }).savedTokens > 0);
  const code = '```js\nconst x = 1;\n\n\n\nconst y = 2;\n```';
  assert.equal(analyze(code, { duplicates: true }).text, code);
});
test('límite de entrada y resultado vacío definido', () => {
  assert.throws(() => analyze('x'.repeat(MAX_LENGTH + 1)), RangeError);
  assert.equal(analyze('').savedPercent, 0);
});
