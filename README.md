# Látigo ↝

**Menos ruido. Más intención.** Optimizador de contexto local, abierto y revisable para preparar peticiones antes de copiarlas a tu IA favorita.

## Probar la versión 0.1

Descarga este repositorio y abre `index.html` en tu navegador. No requiere instalación, claves de API, cuenta ni conexión a Internet. También puedes ejecutar `npm start` con Node.js 20 o posterior y abrir <http://127.0.0.1:4173>.

1. Pega tu petición o carga el ejemplo.
2. Selecciona las reglas que quieras aplicar.
3. Pulsa **Optimizar contexto**.
4. Revisa cada eliminación y copia la salida.

## Qué hace

- Reduce secuencias de líneas vacías a una, fuera de los formatos protegidos.
- Opcionalmente omite párrafos consecutivos exactamente idénticos. Está desactivado por defecto porque la repetición puede expresar énfasis.
- Muestra el texto completo de salida, las eliminaciones y sus líneas en el original.
- Compara caracteres y una **estimación heurística** de tokens: puntos de código Unicode divididos entre cuatro, redondeando hacia arriba.
- Mantiene las palabras, las cifras y las negaciones en el modo predeterminado. No resume ni parafrasea.

El reconocimiento de formato es deliberadamente conservador: los bloques con cercas de tres o más acentos graves o virgulillas se conservan. Al encontrar listas, encabezados, citas, tablas, HTML, JSON o código indentado reconocibles, el motor conserva el resto del documento. Esto puede reducir el ahorro, pero evita manipular formatos que esta primera versión no comprende suficientemente. No es un analizador completo de Markdown ni de lenguajes de programación.

## Límites y expectativas

**No se garantiza equivalencia de respuestas ni una reducción universal de tokens.** Cambiar espacios puede afectar tareas sensibles al formato. Incluso un texto idéntico puede generar distintas respuestas de un modelo. Revisa y prueba la salida en tu tarea.

La cifra de tokens no usa el tokenizador real de ChatGPT, Gemini o Claude. Puede sobreestimar o subestimar mucho, especialmente con código, emojis o idiomas distintos. Un porcentaje de reducción de caracteres no equivale a ese porcentaje de ahorro de tokens. Reducir caracteres tampoco garantiza reducir tokens, costes o consumo de límites de una suscripción.

Látigo no modifica conversaciones de otras plataformas, no accede a tus cuentas y no mide su consumo interno. Las peticiones breves y ya limpias pueden no necesitar cambios. La v0.1 es una base conservadora para medir y mejorar, no un compresor semántico.

## Privacidad

El procesamiento ocurre en memoria en tu navegador. No hay llamadas de red, dependencias externas, fuentes remotas, analítica, cookies ni almacenamiento de tus textos. Recargar cierra el trabajo actual. El enlace a GitHub solo se visita si lo abres. Si sirves la app desde un alojamiento, ese alojamiento puede registrar las solicitudes habituales de archivos, pero la app no envía el texto introducido.

## Desarrollo y pruebas

No hay dependencias que instalar.

```sh
npm test
npm start
```

`engine.js` contiene el motor reutilizable, `app.js` la interfaz y `tests/engine.test.cjs` pruebas de preservación de instrucciones, formatos, Unicode, idempotencia y duplicados. También hay una comprobación generativa determinista de 300 entradas. Las pruebas validan transformaciones de texto; no demuestran equivalencia semántica de respuestas de IA.

Ejemplo de uso desde Node.js:

```js
const { optimize } = require('./engine.js');
const result = optimize('Mi petición\n\n\n\nCon sus restricciones.');
console.log(result.text, result.changes);
```

## Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md). Las mejoras deberían incluir ejemplos que demuestren ahorro y casos donde la transformación deba abstenerse. Prioridades futuras: tokenizadores reales con nombre y versión, más cobertura de formatos y evaluaciones reproducibles de calidad por tarea. No publiques datos personales o claves en ejemplos o incidencias.

Licencia MIT. Proyecto independiente, sin afiliación con los proveedores de IA.
