'use strict';
const $ = id => document.getElementById(id);
const original = $('original');
const optimized = $('optimized');
const format = number => new Intl.NumberFormat('es').format(number);
function invalidate() {
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
$('optimize').addEventListener('click', () => {
  if (!original.value.trim()) { $('status').textContent = 'Escribe o pega una petición para empezar.'; original.focus(); return; }
  const result = Latigo.optimize(original.value, { spacing: $('spacing').checked, duplicates: $('duplicates').checked });
  optimized.value = result.text;
  $('output-count').textContent = `${format(result.text.length)} caracteres`;
  $('before').textContent = `≈ ${format(result.before)}`;
  $('after').textContent = `≈ ${format(result.after)}`;
  $('saving').textContent = `${(100 * result.savedCharacters / original.value.length).toLocaleString('es', { maximumFractionDigits: 1 })} %`;
  $('saved-chars').textContent = `${format(result.savedCharacters)} caracteres menos`;
  $('changes').replaceChildren();
  for (const change of result.changes) {
    const item = document.createElement('li');
    item.textContent = `Línea ${change.line}: ${change.reason}`;
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'Ver contenido eliminado';
    const removed = document.createElement('pre'); removed.textContent = change.removed.replace(/\r/g, '').replace(/\n/g, '↵\n');
    details.append(summary, removed); item.append(details); $('changes').append(item);
  }
  $('change-count').textContent = `${result.changes.length} cambios`;
  $('status').textContent = result.changes.length ? 'Versión lista. Revisa lo eliminado antes de copiar. El ahorro de tokens es aproximado.' : 'No detectamos cambios con estas opciones. Conservar el contexto es preferible a eliminar información útil.';
  $('copy').disabled = false;
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
