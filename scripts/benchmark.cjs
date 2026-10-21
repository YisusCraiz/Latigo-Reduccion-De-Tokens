const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { analyze } = require('../src/analyze.cjs');
const { metadata } = require('../src/tokenizer.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const cases = JSON.parse(read('benchmarks/cases.json'));
const rows = [];
for (const mode of ['conservative', 'duplicates-opt-in']) {
  for (const fixture of cases) {
    const text = fixture.text + (fixture.appendBlankLines ? '\n'.repeat(fixture.appendBlankLines) : '') + (fixture.suffix || '');
    const result = analyze(text, { duplicates: mode === 'duplicates-opt-in' });
    const requirementsPreserved = fixture.preserve.every(value => result.text.includes(value));
    const nonWhitespacePreserved = text.replace(/\s/g, '') === result.text.replace(/\s/g, '');
    const expectedUnchanged = !fixture.unchanged || result.text === text;
    assert.ok(requirementsPreserved, `${mode}/${fixture.id}: requisito eliminado`);
    assert.ok(expectedUnchanged, `${mode}/${fixture.id}: formato protegido modificado`);
    if (mode === 'conservative') assert.ok(nonWhitespacePreserved);
    assert.ok(result.after <= result.before);
    rows.push({ mode, id: fixture.id, description: fixture.description, before: result.before, after: result.after, savedTokens: result.savedTokens, savedPercent: Number(result.savedPercent.toFixed(2)), decision: result.decision, requirementsPreserved, nonWhitespacePreserved, expectedUnchanged, semanticRisk: fixture.semanticRisk || null });
  }
}
const summaries = ['conservative', 'duplicates-opt-in'].map(mode => {
  const selected = rows.filter(row => row.mode === mode);
  const before = selected.reduce((sum, row) => sum + row.before, 0);
  const after = selected.reduce((sum, row) => sum + row.after, 0);
  return { mode, cases: selected.length, before, after, savedTokens: before - after, savedPercent: Number((100 * (before - after) / before).toFixed(2)), improvedCases: selected.filter(row => row.savedTokens > 0).length, rejectedCandidates: selected.filter(row => row.decision === 'no-token-benefit').length, preservationChecksPassed: selected.every(row => row.requirementsPreserved && row.expectedUnchanged) };
});
const hashes = Object.fromEntries(['benchmarks/cases.json', 'engine.js', 'src/tokenizer.cjs', 'src/analyze.cjs', 'scripts/benchmark.cjs'].map(file => [file, crypto.createHash('sha256').update(read(file)).digest('hex')]));
const report = { version: require('../package.json').version, dataset: 'latigo-synthetic-v1', tokenizer: metadata, methodology: 'Texto plano; suma de tokens por caso, sin promediar porcentajes. Entradas sintéticas, no representativas de uso real.', modelEvaluation: { performed: false, model: null, quality: 'NOT_EVALUATED', retries: null, outputTokens: null, totalTaskCost: null }, hashes, summaries, rows };
const table = rows.map(row => `| ${row.mode} | ${row.id} | ${row.before} | ${row.after} | ${row.savedTokens} | ${row.savedPercent.toFixed(2)} % | ${row.decision} |`).join('\n');
const md = `# Informe reproducible · Látigo ${report.version}\n\n` +
  `Codificación: **${metadata.encoding}**. Implementación: **${metadata.library} ${metadata.version}**. Los marcadores especiales introducidos por el usuario se cuentan como texto ordinario.\n\n` +
  `## Alcance\n\n16 casos sintéticos públicos, ejecutados en dos modos. Incluyen texto limpio, duplicados, énfasis, negaciones, Unicode, código y formatos protegidos. No son una muestra representativa y sus porcentajes no predicen tu ahorro. No se hicieron llamadas a modelos ni se midieron respuestas, reintentos o costes reales de una tarea. **La calidad semántica de las respuestas NO ESTÁ EVALUADA.**\n\n` +
  `## Totales\n\n` + summaries.map(s => `- **${s.mode}:** ${s.before} → ${s.after} tokens; ${s.savedTokens} menos (${s.savedPercent.toFixed(2)} %). ${s.improvedCases}/${s.cases} casos con ahorro; ${s.rejectedCandidates} limpiezas descartadas por no ahorrar tokens.`).join('\n') +
  `\n\nEl porcentaje total usa la suma de tokens de todas las entradas y salidas, no la media de los porcentajes. El modo opcional elimina repeticiones que podrían aportar énfasis: un ahorro mayor no demuestra mejor calidad. Todos los requisitos literales declarados y casos marcados como protegidos pasan sus comprobaciones. El modo conservador conserva todos los caracteres no blancos. Estos controles no sustituyen una evaluación de respuestas.\n\n` +
  `## Resultados por caso\n\n| Modo | Caso | Antes | Después | Ahorro | Reducción | Decisión |\n| --- | --- | ---: | ---: | ---: | ---: | --- |\n${table}\n\n` +
  `## Reproducir\n\nCon Node.js 22 o posterior y pnpm 11.25.0:\n\n\`\`\`sh\npnpm install --frozen-lockfile\npnpm test\npnpm benchmark\npnpm benchmark:check\n\`\`\`\n\nEl comando benchmark regenera este archivo y results.json. El comando benchmark:check falla si no coinciden con el código y los datos actuales. results.json incluye huellas SHA-256 de las fuentes normalizadas a LF para permitir verificar el conjunto exacto.\n\n` +
  `## Qué falta para demostrar calidad\n\nPara cada tarea habría que ejecutar original y optimizado varias veces con el mismo modelo y configuración, evaluar requisitos de salida con una rúbrica y contabilizar tokens de entrada, salida y reintentos hasta lograr el objetivo. No debe inferirse esa equivalencia de estos resultados. Ver [EVALUATION.md](EVALUATION.md).\n`;
for (const [file, content] of [['benchmarks/results.json', JSON.stringify(report, null, 2) + '\n'], ['benchmarks/REPORT.md', md]]) {
  if (process.argv.includes('--check')) assert.equal(read(file), content, `${file} está desactualizado. Ejecuta pnpm benchmark.`);
  else fs.writeFileSync(path.join(root, file), content);
}
console.log(JSON.stringify(summaries, null, 2));
