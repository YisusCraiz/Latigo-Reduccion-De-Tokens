(function (root) {
  'use strict';
  // No tokenizers, models or network calls: this estimate is deliberately labelled.
  const estimateTokens = text => Math.ceil(Array.from(text).length / 4);
  const structured = line => /^(?: {4}|\t|\s*(?:[#>|]|[-+*]\s|\d+[.)]\s|<|\{|\[))/.test(line);
  function optimize(text, options = {}) {
    if (typeof text !== 'string') throw new TypeError('El contexto debe ser texto.');
    const spacing = options.spacing !== false;
    const duplicates = options.duplicates === true;
    const changes = [];
    const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
    const output = [];
    let fence = null, previousParagraph = null;
    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      const content = line.replace(/\r?\n$/, '');
      const marker = content.match(/^ {0,3}(`{3,}|~{3,})/);
      if (fence) {
        output.push(line);
        if (new RegExp('^ {0,3}' + fence.char + '{' + fence.length + ',}\\s*$').test(content)) fence = null;
        previousParagraph = null; i++; continue;
      }
      if (marker) {
        fence = { char: marker[1][0], length: marker[1].length };
        output.push(line); previousParagraph = null; i++; continue;
      }
      if (/^\s*$/.test(content)) {
        let end = i + 1;
        while (end < lines.length && /^\s*$/.test(lines[end])) end++;
        const nearStructure = structured(lines[i - 1] || '') || structured(lines[end] || '');
        const keep = spacing && !nearStructure ? Math.min(1, end - i) : end - i;
        output.push(lines.slice(i, i + keep).join(''));
        if (keep < end - i) changes.push({ line: i + 1, reason: 'Líneas vacías excesivas reducidas a una.', removed: lines.slice(i + keep, end).join('') });
        i = end; continue;
      }
      if (structured(content)) {
        // Unknown structured input is passed through as a whole. This also protects
        // multiline HTML, indented code, lists and JSON from whitespace changes.
        output.push(lines.slice(i).join('')); break;
      }
      let end = i + 1;
      while (end < lines.length && !/^\s*$/.test(lines[end]) && !structured(lines[end]) && !/^ {0,3}(?:`{3,}|~{3,})/.test(lines[end])) end++;
      const paragraph = lines.slice(i, end).join('');
      const comparable = paragraph.replace(/\r?\n$/, '');
      if (duplicates && comparable === previousParagraph) {
        changes.push({ line: i + 1, reason: 'Párrafo consecutivo idéntico omitido. Comprueba que no expresaba énfasis.', removed: paragraph });
      } else output.push(paragraph);
      previousParagraph = comparable; i = end;
    }
    const result = output.join('');
    return { text: result, changes, before: estimateTokens(text), after: estimateTokens(result), savedCharacters: text.length - result.length };
  }
  const api = { optimize, estimateTokens };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Latigo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
