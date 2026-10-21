(function (root) {
  'use strict';
  class TokenWorkerClient {
    constructor(source, { timeout = 15000, workerFactory } = {}) {
      this.source = source;
      this.timeout = timeout;
      this.workerFactory = workerFactory || (source => {
        const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
        try { return new Worker(url); } finally { URL.revokeObjectURL(url); }
      });
      this.sequence = 0;
      this.worker = null;
      this.pending = null;
    }
    stop(message = 'Análisis cancelado.') {
      this.worker?.terminate(); this.worker = null;
      if (this.pending) {
        clearTimeout(this.pending.timer);
        const { reject } = this.pending; this.pending = null; reject(new Error(message));
      }
    }
    analyze(text, options) {
      this.stop();
      return new Promise((resolve, reject) => {
        const id = ++this.sequence;
        try { this.worker = this.workerFactory(this.source); }
        catch { reject(new Error('Este navegador no pudo iniciar el contador local. Prueba un navegador actualizado o usa el servidor local.')); return; }
        const finish = (error, result) => {
          if (!this.pending || this.pending.id !== id) return;
          clearTimeout(this.pending.timer);
          this.pending = null;
          this.worker?.terminate(); this.worker = null;
          if (error) reject(new Error(error)); else resolve(result);
        };
        this.pending = { id, reject, timer: setTimeout(() => finish('El conteo tardó demasiado. Prueba un texto más corto; el original sigue intacto.'), this.timeout) };
        this.worker.onmessage = event => {
          if (event.data.id === id) finish(event.data.error, event.data.result);
        };
        this.worker.onerror = () => finish('No se pudo ejecutar el contador local. El original sigue intacto.');
        try { this.worker.postMessage({ id, text, options }); }
        catch { finish('No se pudo iniciar el análisis. El original sigue intacto.'); }
      });
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { TokenWorkerClient };
  else root.TokenWorkerClient = TokenWorkerClient;
})(typeof globalThis !== 'undefined' ? globalThis : this);
