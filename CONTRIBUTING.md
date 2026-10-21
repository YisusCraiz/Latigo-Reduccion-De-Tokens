# Contribuir a Látigo

Abre una incidencia con el comportamiento esperado y un ejemplo mínimo sin datos privados. Para cambios de código, crea una rama y un pull request.

- Conserva el funcionamiento sin claves y sin solicitudes de red.
- Las reglas con posible pérdida de significado deben ser opcionales y explicar qué eliminan.
- Acompaña las reglas nuevas de pruebas de casos protegidos y de fallos conocidos.
- Usa Node.js 22+ y pnpm 11.25.0. Ejecuta `pnpm build`, `pnpm test`, `pnpm benchmark` y `pnpm benchmark:check`; incluye el bundle y los informes regenerados en tu pull request. Revisa la interfaz en móvil y escritorio, así como el arranque desde `index.html` sin servidor.
- El analizador devuelve el original cuando la propuesta no ahorra tokens con la codificación declarada. Mantén esta protección y las rutas de cancelación y error.
- No anuncies porcentajes de ahorro de tokens a partir de caracteres. Las evaluaciones con modelos deben identificar modelo, tokenizador, fecha, tareas, costes totales y criterio de calidad.

No envíes prompts reales de terceros ni secretos. Para avisos de seguridad, evita publicar datos explotables o credenciales en incidencias públicas.
