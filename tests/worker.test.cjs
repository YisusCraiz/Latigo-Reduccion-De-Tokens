const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { TokenWorkerClient } = require('../token-worker-client.js');
const { analyze } = require('../src/analyze.cjs');
test('el bundle del navegador funciona sin red y coincide con Node', () => {
  const outer = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/tokenizer.js'), 'utf8'), outer);
  let response;
  const self = { postMessage: value => { response = value; } };
  vm.runInNewContext(outer.LatigoWorkerSource, { self, TextEncoder, TextDecoder });
  for (const text of ['hello world', 'A' + '\n'.repeat(80) + 'B', 'お誕生日おめでとう 🙂', '<|endoftext|>']) {
    self.onmessage({ data: { id: 42, text, options: {} } });
    assert.equal(response.id, 42);
    assert.deepEqual(JSON.parse(JSON.stringify(response.result)), analyze(text));
  }
});
function fixture(timeout = 1000) {
  const workers = [];
  const client = new TokenWorkerClient('source', { timeout, workerFactory: () => {
    const worker = { terminated: false, terminate() { this.terminated = true; }, postMessage(value) { this.message = value; } };
    workers.push(worker); return worker;
  } });
  return { client, workers };
}
test('resuelve resultados y libera el worker', async () => {
  const { client, workers } = fixture();
  const promise = client.analyze('texto', {});
  const worker = workers[0];
  worker.onmessage({ data: { id: worker.message.id, result: { before: 2 } } });
  assert.deepEqual(await promise, { before: 2 });
  assert.ok(worker.terminated);
});
test('cancelar y editar impide reutilizar resultados anteriores', async () => {
  const { client, workers } = fixture();
  const first = client.analyze('antes', {});
  const rejected = assert.rejects(first, /cancelado/);
  const second = client.analyze('después', {});
  await rejected;
  assert.ok(workers[0].terminated);
  workers[0].onmessage({ data: { id: workers[0].message.id, result: { old: true } } });
  workers[1].onmessage({ data: { id: workers[1].message.id, result: { current: true } } });
  assert.deepEqual(await second, { current: true });
});
test('timeout termina el worker sin devolver conteos inventados', async () => {
  const { client, workers } = fixture(10);
  await assert.rejects(client.analyze('texto', {}), /tardó demasiado/);
  assert.ok(workers[0].terminated);
});
test('errores de ejecución o arranque son recuperables', async () => {
  const { client, workers } = fixture();
  const promise = client.analyze('texto', {});
  workers[0].onerror();
  await assert.rejects(promise, /contador local/);
  assert.ok(workers[0].terminated);
  const broken = new TokenWorkerClient('', { workerFactory: () => { throw new Error('Unavailable'); } });
  await assert.rejects(broken.analyze('texto', {}), /navegador/);
});
