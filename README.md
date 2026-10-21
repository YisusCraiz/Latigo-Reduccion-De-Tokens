# Látigo ↝

**Menos ruido. Más intención.** Optimizador local y revisable de contexto para IA. La **v0.2** incorpora conteo de texto con un tokenizador real, protección frente a limpiezas que no ahorran tokens y un informe reproducible.

## Probar

Descarga **todo el repositorio** y abre `index.html` en un navegador moderno. No necesitas instalar dependencias, crear cuentas ni introducir claves: el tokenizador ya está incluido en `assets/tokenizer.js`. También puedes ejecutar `node scripts/serve.cjs` y abrir <http://127.0.0.1:4173>.

1. Pega tu petición o carga el ejemplo.
2. Deja el modo conservador o activa la eliminación opcional de párrafos consecutivos idénticos.
3. Pulsa **Optimizar contexto**. El conteo se ejecuta en un Web Worker local; puedes cancelarlo o seguir editando.
4. Revisa los cambios y copia la salida.

Si una limpieza no reduce los tokens contados, Látigo devuelve el original y explica por qué. Por eso el ejemplo puede mostrar **0 %** en modo conservador aunque tenga líneas vacías de sobra. No eliminamos información solo para mostrar un porcentaje.

## Qué cuenta exactamente

| Propiedad | Valor |
| --- | --- |
| Codificación | `cl100k_base` |
| Implementación | `js-tiktoken` **1.0.21**, port comunitario de tiktoken |
| Unidad | Tokens del texto plano introducido, sin envoltura de mensajes |
| Marcadores especiales | Secuencias como `<\|endoftext\|>` se cuentan como texto ordinario |
| Reducción mostrada | `(tokens originales − tokens finales) / tokens originales × 100` |

Ya no se usa `caracteres / 4` en la interfaz ni en el informe. El motor básico de la v0.1 conserva su estimación por compatibilidad; para conteos reales usa `src/analyze.cjs`.

`cl100k_base` es una codificación documentada por OpenAI para modelos como GPT-4 y GPT-3.5 Turbo históricos; **no se supone que sea la codificación del modelo que tengas seleccionado actualmente**. Consulta el [OpenAI Cookbook](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken). No contamos Gemini ni Claude con su tokenizador propio. La app no identifica automáticamente proveedores ni modelos.

El conteo es exacto para esta codificación y este texto, **no para la solicitud completa de una plataforma**: no incluye instrucciones internas, roles, herramientas, imágenes, archivos, historial no pegado, respuestas ni razonamiento. La [documentación oficial de OpenAI sobre conteo](https://developers.openai.com/api/docs/guides/token-counting) explica estas diferencias. Tampoco predice el coste o los límites de una suscripción.

## Qué cambia y qué protege

- Reduce secuencias excesivas de líneas vacías a una fuera de los formatos protegidos.
- Opcionalmente omite párrafos consecutivos exactamente idénticos. Está desactivado por defecto: repetir puede expresar énfasis.
- Conserva las palabras, cifras y negaciones en el modo predeterminado. No resume ni parafrasea.
- Muestra las eliminaciones y sus líneas en el original. Si la propuesta no ahorra tokens, no la aplica.

El reconocimiento de formato es deliberadamente conservador: los bloques cercados con tres o más acentos graves o virgulillas se conservan. Ante listas, encabezados, citas, tablas, HTML, JSON o código indentado reconocibles, el motor conserva el resto del documento. No es un analizador completo de Markdown o de lenguajes de programación. Incluso los espacios pueden ser relevantes; revisa el resultado antes de usarlo.

**No garantizamos respuestas equivalentes.** El conteo mide tokens; no demuestra que un modelo resolverá igual una tarea. La app admite hasta 200.000 unidades UTF-16; el análisis se detiene después de 15 segundos para evitar bloquear la interfaz con textos difíciles. No hay un contador aproximado oculto si falla el tokenizador.

## Resultados reproducibles

Lee [el informe completo](benchmarks/REPORT.md), [los datos de resultados](benchmarks/results.json) y [los 16 casos públicos](benchmarks/cases.json).

En este conjunto **sintético y no representativo**, el modo conservador pasa de **321 a 317 tokens (1,25 %)**. El modo con duplicados optativos pasa de **321 a 258 (19,63 %)**. El segundo puede quitar énfasis intencional. No extrapoles esos porcentajes al uso diario.

Se comprueban requisitos literales, formatos protegidos y preservación de caracteres no blancos en modo conservador. **No se han evaluado respuestas de modelos, reintentos ni costes totales de tareas.** [El protocolo de evaluación](benchmarks/EVALUATION.md) describe cómo medirlos sin confundir ahorro de entrada y calidad.

## Privacidad

El texto se procesa en memoria en tu navegador, dentro de un Web Worker. No hay llamadas a modelos, CDN, analítica, cookies ni almacenamiento de prompts. El vocabulario viene incluido en la descarga. No se guardan ni se incluyen tus textos en el informe público; sus ejemplos son sintéticos. Cerrar o recargar descarta el trabajo. Los enlaces externos solo se visitan si los abres. Si alojas la app, el alojamiento puede registrar las solicitudes normales de archivos; la app no le envía tus prompts.

## Desarrollo

Requisitos: Node.js **22 o posterior** y pnpm **11.25.0**. Las versiones y la integridad de dependencias están fijadas en `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm benchmark
pnpm benchmark:check
pnpm start
```

`pnpm build` genera el bundle incluido. Actualízalo al modificar el motor, el analizador o el tokenizador. La integración continua comprueba el bundle regenerado, las pruebas y que el informe no esté desactualizado. Se mantiene el script de instalación de esbuild desactivado: su binario se obtiene como dependencia de plataforma desde el registro.

| Archivo | Función |
| --- | --- |
| `engine.js` | Reglas de limpieza sin llamadas a modelos |
| `src/tokenizer.cjs` | Codificación local y versión identificada |
| `src/analyze.cjs` | Conteo original/propuesta y protección contra ahorro nulo |
| `src/worker.cjs` | Análisis fuera del hilo de interfaz |
| `token-worker-client.js` | Cancelación, límite de tiempo y gestión del worker |
| `benchmarks/` | Casos públicos, informe y protocolo de calidad |

Uso desde Node.js, con dependencias instaladas:

```js
const { analyze } = require('./src/analyze.cjs');
const result = analyze('Mi petición\n\n\n\nCon sus restricciones.');
console.log(result.before, result.after, result.decision, result.text);
```

## Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md). Prioridades futuras: ampliar codificaciones identificadas y evaluar calidad por tarea antes de introducir compresión semántica. No publiques datos personales ni claves en ejemplos o incidencias.

Licencia MIT. Consulta [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) para los componentes incluidos. Proyecto independiente, sin afiliación con proveedores de IA.
