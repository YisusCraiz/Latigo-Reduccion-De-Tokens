const { test } = require('node:test');
const assert = require('node:assert/strict');
const { optimize, estimateTokens } = require('../engine.js');
test('reduce líneas vacías sin modificar instrucciones, cifras o negaciones', () => {
  const input = 'No traduzcas los nombres.\n\n\n\nPresupuesto: 250 MXN. Máximo 80 palabras.';
  const result = optimize(input);
  assert.equal(result.text, 'No traduzcas los nombres.\n\nPresupuesto: 250 MXN. Máximo 80 palabras.');
  assert.equal(result.text.replace(/\s/g, ''), input.replace(/\s/g, ''));
  assert.equal(result.changes.length, 1);
});
test('no elimina repeticiones por defecto', () => {
  const input = 'No compartas datos.\n\nNo compartas datos.';
  assert.equal(optimize(input).text, input);
  assert.equal(optimize(input, { duplicates: true }).text, 'No compartas datos.\n\n');
});
test('preserva código cercado, cercas largas y bloques sin cerrar', () => {
  for (const fence of ['```', '~~~~', '````']) {
    const input = `${fence}python\nprint(1)\n\n\n\nprint(2)\n${fence}\n`;
    assert.equal(optimize(input, { duplicates: true }).text, input);
    assert.equal(optimize(input.slice(0, -fence.length - 1)).text, input.slice(0, -fence.length - 1));
  }
});
test('preserva markdown estructurado, JSON, HTML y código indentado', () => {
  for (const prefix of ['# Título', '- Elemento', '1. Paso', '> Cita', '| A | B |', '    código', '{', '[', '<pre>']) {
    const input = `${prefix}\n\n\n\nContenido\n\nContenido`;
    assert.equal(optimize(input, { duplicates: true }).text, input);
  }
});
test('preserva saltos markdown de dos espacios, tabulaciones y CRLF', () => {
  const input = 'Línea  \r\nOtra\r\n\r\n\r\n\r\nFinal';
  assert.equal(optimize(input).text, 'Línea  \r\nOtra\r\n\r\nFinal');
  assert.equal(optimize('A\tB').text, 'A\tB');
});
test('desactivar opciones conserva exactamente el original', () => {
  const input = '\n\n\nA\n\n\nA\n';
  assert.equal(optimize(input, { spacing: false }).text, input);
});
test('no elimina párrafos diferentes o duplicados no consecutivos', () => {
  const input = 'Uno\n\nDos\n\nUno';
  assert.equal(optimize(input, { duplicates: true }).text, input);
});
test('es idempotente y conserva todos los caracteres no blancos por defecto', () => {
  let seed = 42;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let i = 0; i < 300; i++) {
    const input = Array.from({ length: 20 }, () => ['No borres 250 MXN.', '日本語 🙂', '', '', '', 'Respuesta de 80 palabras.'][Math.floor(random() * 6)]).join('\n');
    const result = optimize(input).text;
    assert.equal(result.replace(/\s/g, ''), input.replace(/\s/g, ''));
    assert.equal(optimize(result).text, result);
  }
});
test('vacío, unicode y estimación explícita', () => {
  assert.equal(optimize('').text, '');
  assert.equal(estimateTokens('🙂🙂🙂🙂'), 1);
  assert.throws(() => optimize(null), TypeError);
});
test('maneja entradas grandes sin desbordar argumentos', () => {
  const input = '# Estructura\n' + '\n'.repeat(199000);
  assert.equal(optimize(input).text, input);
  assert.equal(optimize('\n'.repeat(200000), { spacing: false }).text.length, 200000);
});
