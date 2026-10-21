'use strict';
const $ = id => document.getElementById(id);
const original = $('original');
const optimized = $('optimized');
const format = number => new Intl.NumberFormat('es').format(number);
const counter = new TokenWorkerClient(globalThis.LatigoWorkerSource);
let revision = 0;
let busy = false;
function setBusy(value) {
  busy = value;
  $('optimize').textContent = value ? 'Cancelar análisis ×' : 'Optimizar contexto ↗';
  $('workspace').setAttribute('aria-busy', String(value));
}
function invalidate() {
  revision++;
  counter.stop(); setBusy(false);
  optimized.value = '';
  $('input-count').textContent = `${format(original.value.length)} caracteres`;
  $('output-count').textContent = '0 caracteres';
  for (const id of ['before', 'after', 'saving']) $(id).textContent = '—';
  $('saved-chars').textContent = 'sin cambios todavía';
  $('changes').replaceChildren();
  $('change-count').textContent = 'Sin análisis';
  $('copy').disabled = true;
  $('status').textContent = 'Tu texto no se envía ni se guarda. Optimiza para revisar los cambios.';
}
original.addEventListener('input', invalidate);
for (const id of ['spacing', 'duplicates']) $(id).addEventListener('change', invalidate);
$('clear').addEventListener('click', () => { original.value = ''; invalidate(); original.focus(); });
$('example').addEventListener('click', () => {
  original.value = 'Redacta una invitación para el taller de fotografía del sábado.\n\n\n\nEl taller empieza a las 10:00, cuesta 250 MXN y tiene 12 plazas.\n\n\n\nConserva esos datos. Usa un tono cercano y un máximo de 80 palabras.\n\nConserva esos datos. Usa un tono cercano y un máximo de 80 palabras.';
  invalidate(); original.focus();
});
$('optimize').addEventListener('click', async () => {
  if (busy) { invalidate(); $('status').textContent = 'Análisis cancelado. El original sigue intacto.'; return; }
  if (!original.value.trim()) { $('status').textContent = 'Escribe o pega una petición para empezar.'; original.focus(); return; }
  const currentRevision = revision;
  setBusy(true);
  $('copy').disabled = true;
  $('status').textContent = 'Contando tokens con cl100k_base en tu dispositivo… Puedes cancelar o seguir editando.';
  try {
    if (typeof globalThis.LatigoWorkerSource !== 'string') throw new Error('Falta el tokenizador incluido. Descarga el repositorio completo o ejecuta pnpm build.');
    const result = await counter.analyze(original.value, { spacing: $('spacing').checked, duplicates: $('duplicates').checked });
    if (revision !== currentRevision) return;
    optimized.value = result.text;
    $('output-count').textContent = `${format(result.text.length)} caracteres`;
    $('before').textContent = format(result.before);
    $('after').textContent = format(result.after);
    $('saving').textContent = `${result.savedPercent.toLocaleString('es', { maximumFractionDigits: 1 })} %`;
    $('saved-chars').textContent = `${format(result.savedTokens)} tokens · ${format(result.savedCharacters)} caracteres menos`;
    $('changes').replaceChildren();
    for (const change of result.changes) {
      const item = document.createElement('li');
      item.textContent = `Línea ${change.line}: ${change.reason}`;
      const details = document.createElement('details');
      const summary = document.createElement('summary'); summary.textContent = 'Ver contenido eliminado';
      const removed = document.createElement('pre'); removed.textContent = change.removed.replace(/\r/g, '').replace(/\n/g, '↵\n');
      details.append(summary, removed); item.append(details); $('changes').append(item);
    }
    $('change-count').textContent = `${result.changes.length} cambios aplicados`;
    $('status').textContent = result.decision === 'accepted'
      ? 'Reducción medida con cl100k_base. Revisa las eliminaciones: el conteo no demuestra que la respuesta de una IA será equivalente.'
      : result.decision === 'no-token-benefit'
        ? `Conservamos el original: la limpieza propuesta no ahorraba tokens (${format(result.before)} → ${format(result.candidateAfter)}).`
        : 'No detectamos cambios con estas opciones. Tu contexto se conserva completo.';
    $('copy').disabled = false;
  } catch (error) {
    if (revision === currentRevision) { invalidate(); $('status').textContent = error.message; }
  } finally { if (revision === currentRevision) setBusy(false); }
});
$('copy').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(optimized.value);
    $('status').textContent = 'Resultado copiado. Ya puedes pegarlo en tu IA.';
  } catch {
    optimized.focus(); optimized.select();
    $('status').textContent = 'El navegador no permitió copiar automáticamente. Texto seleccionado: usa Ctrl+C o la opción Copiar de tu dispositivo.';
  }
});
