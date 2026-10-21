# Cambios

## 0.2.0

- Conteo real del texto con `cl100k_base` y `js-tiktoken` 1.0.21 incluido localmente; se retira la heurística de la interfaz.
- Comparación del original y la propuesta: se descartan limpiezas que no ahorran tokens.
- Web Worker local con cancelación, invalidación al editar y límite de 15 segundos.
- Benchmark público de 16 casos en dos modos, informes JSON y Markdown reproducibles y protocolo para futuras evaluaciones de calidad.
- Pruebas de referencia de tokenización, paridad del bundle del navegador y gestión de workers; integración continua con dependencias fijadas y revisión del informe.
- Avisos de licencia de componentes incluidos y documentación de límites del conteo.

## 0.1.0

- Primera versión local con limpieza de líneas vacías, duplicados optativos, revisión de cambios y estimación por caracteres.
