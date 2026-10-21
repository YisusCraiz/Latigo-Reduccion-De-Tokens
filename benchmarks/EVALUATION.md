# Evaluar calidad en una tarea real

La evaluación incluida solo verifica conteos y propiedades del texto. No contiene resultados de modelos inventados ni utiliza tus claves.

Para incorporar evaluaciones de respuestas:

1. Selecciona tareas públicas con criterios de éxito fijados antes de ejecutar: hechos obligatorios, prohibiciones, formato y límites de extensión. Incluye tareas sensibles a espacios y énfasis.
2. Publica el prompt original y la salida exacta de Látigo, su versión, opciones y codificación. No uses datos privados.
3. Ejecuta ambas variantes con el mismo modelo identificado, configuración, herramientas y contexto. Repite varias veces y alterna el orden para reducir sesgos.
4. Evalúa a ciegas con la rúbrica, incluyendo revisión humana cuando la tarea no pueda comprobarse automáticamente. Conserva los fallos; no selecciones solo resultados favorables.
5. Registra entrada, salida, tokens de razonamiento cuando el proveedor los reporte, caché, reintentos y precio vigente. Compara el gasto total hasta conseguir una respuesta que cumpla la rúbrica.
6. Publica número de casos, distribución de resultados e incertidumbre. No extrapoles a otros modelos ni a suscripciones de chat.

## Formato sugerido de registro

```json
{
  "taskId": "identificador-publico",
  "model": "identificador-exacto-del-proveedor",
  "date": "AAAA-MM-DD",
  "latigoVersion": "0.2.0",
  "variant": "original-u-optimizado",
  "trial": 1,
  "configuration": {},
  "attempts": [],
  "rubric": {},
  "passed": null,
  "totalInputTokens": null,
  "totalOutputTokens": null,
  "totalCost": null
}
```

Los valores nulos significan **no medido**, nunca cero. El ahorro de tokens del texto de entrada es una medición separada de la equivalencia de respuestas y del coste final.
