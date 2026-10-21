const { analyze } = require('./analyze.cjs');
self.onmessage = event => {
  const { id, text, options } = event.data;
  try { self.postMessage({ id, result: analyze(text, options) }); }
  catch { self.postMessage({ id, error: 'No se pudo contar este texto. Conserva el original e inténtalo con un fragmento más corto.' }); }
};
