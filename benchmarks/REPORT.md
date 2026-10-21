# Informe reproducible · Látigo 0.2.0

Codificación: **cl100k_base**. Implementación: **js-tiktoken 1.0.21**. Los marcadores especiales introducidos por el usuario se cuentan como texto ordinario.

## Alcance

16 casos sintéticos públicos, ejecutados en dos modos. Incluyen texto limpio, duplicados, énfasis, negaciones, Unicode, código y formatos protegidos. No son una muestra representativa y sus porcentajes no predicen tu ahorro. No se hicieron llamadas a modelos ni se midieron respuestas, reintentos o costes reales de una tarea. **La calidad semántica de las respuestas NO ESTÁ EVALUADA.**

## Totales

- **conservative:** 321 → 317 tokens; 4 menos (1.25 %). 2/16 casos con ahorro; 1 limpiezas descartadas por no ahorrar tokens.
- **duplicates-opt-in:** 321 → 258 tokens; 63 menos (19.63 %). 6/16 casos con ahorro; 1 limpiezas descartadas por no ahorrar tokens.

El porcentaje total usa la suma de tokens de todas las entradas y salidas, no la media de los porcentajes. El modo opcional elimina repeticiones que podrían aportar énfasis: un ahorro mayor no demuestra mejor calidad. Todos los requisitos literales declarados y casos marcados como protegidos pasan sus comprobaciones. El modo conservador conserva todos los caracteres no blancos. Estos controles no sustituyen una evaluación de respuestas.

## Resultados por caso

| Modo | Caso | Antes | Después | Ahorro | Reducción | Decisión |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| conservative | clean-es | 19 | 19 | 0 | 0.00 % | unchanged |
| conservative | short-spacing | 10 | 10 | 0 | 0.00 % | no-token-benefit |
| conservative | long-spacing | 21 | 18 | 3 | 14.29 % | accepted |
| conservative | duplicate-constraint | 50 | 50 | 0 | 0.00 % | unchanged |
| conservative | emphasis-risk | 14 | 14 | 0 | 0.00 % | unchanged |
| conservative | different-numbers | 18 | 18 | 0 | 0.00 % | unchanged |
| conservative | nonconsecutive | 19 | 19 | 0 | 0.00 % | unchanged |
| conservative | fenced-code | 13 | 13 | 0 | 0.00 % | unchanged |
| conservative | json | 18 | 18 | 0 | 0.00 % | unchanged |
| conservative | markdown-list | 20 | 20 | 0 | 0.00 % | unchanged |
| conservative | multilingual | 20 | 20 | 0 | 0.00 % | unchanged |
| conservative | special-spelling | 22 | 22 | 0 | 0.00 % | unchanged |
| conservative | hard-break | 10 | 10 | 0 | 0.00 % | unchanged |
| conservative | crlf | 14 | 13 | 1 | 7.14 % | accepted |
| conservative | html | 9 | 9 | 0 | 0.00 % | unchanged |
| conservative | negation | 44 | 44 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | clean-es | 19 | 19 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | short-spacing | 10 | 10 | 0 | 0.00 % | no-token-benefit |
| duplicates-opt-in | long-spacing | 21 | 18 | 3 | 14.29 % | accepted |
| duplicates-opt-in | duplicate-constraint | 50 | 30 | 20 | 40.00 % | accepted |
| duplicates-opt-in | emphasis-risk | 14 | 7 | 7 | 50.00 % | accepted |
| duplicates-opt-in | different-numbers | 18 | 18 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | nonconsecutive | 19 | 19 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | fenced-code | 13 | 13 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | json | 18 | 18 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | markdown-list | 20 | 20 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | multilingual | 20 | 10 | 10 | 50.00 % | accepted |
| duplicates-opt-in | special-spelling | 22 | 22 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | hard-break | 10 | 10 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | crlf | 14 | 13 | 1 | 7.14 % | accepted |
| duplicates-opt-in | html | 9 | 9 | 0 | 0.00 % | unchanged |
| duplicates-opt-in | negation | 44 | 22 | 22 | 50.00 % | accepted |

## Reproducir

Con Node.js 22 o posterior y pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm benchmark
pnpm benchmark:check
```

El comando benchmark regenera este archivo y results.json. El comando benchmark:check falla si no coinciden con el código y los datos actuales. results.json incluye huellas SHA-256 de las fuentes normalizadas a LF para permitir verificar el conjunto exacto.

## Qué falta para demostrar calidad

Para cada tarea habría que ejecutar original y optimizado varias veces con el mismo modelo y configuración, evaluar requisitos de salida con una rúbrica y contabilizar tokens de entrada, salida y reintentos hasta lograr el objetivo. No debe inferirse esa equivalencia de estos resultados. Ver [EVALUATION.md](EVALUATION.md).
