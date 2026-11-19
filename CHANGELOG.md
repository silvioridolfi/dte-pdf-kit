# Changelog

Formato libre, en español rioplatense, un bloque por versión (tag en
GitHub). No sigue semver estricto -- el paquete es de uso interno,
instalado por SHA o tag fijo.

## v0.5.4

- **Importante, rompía el build de cualquier app que lo consuma
  desde una ruta server-only de Next.js (Route Handlers, Server
  Components):** importar *cualquier cosa* del paquete (aunque el
  reporte no usara `StackedBar`/`ColumnChart`/`ChartCard`) crasheaba
  con `"createContext is not a function"`, o directamente no
  importaba, bajo la condición de resolución `"react-server"` que
  usan esos entornos -- el build de React para ahí no tiene
  `createContext`/`useContext`, y `chart-common.ts` los usaba con un
  `import { createContext, useContext } from 'react'` a nivel de
  módulo, además de crear el `Context` de `ChartCard` al cargar el
  módulo (`export const ChartCardWidthContext = createContext(null)`).
  Encontrado al actualizar bitacora-pp a v0.5.3. Corregido con un
  import de namespace (`import * as React from 'react'`) -- nunca
  falla por una propiedad que falte -- y creando el `Context` recién
  la primera vez que hace falta (al renderizar `ChartCard` o llamar
  `useChartCardWidth`), nunca al cargar el módulo.

## v0.5.3

- `PdfPage`: el margen superior de la hoja 1 pasa de 29 a 17 mm con
  `header="afterFirstPage"`; los informes con `ReportHero` arrancan
  más arriba. Puede cambiar dónde cae algún corte de hoja. Las hojas
  2 en adelante conservan los 29 mm y la barra fina, igual que antes;
  los demás modos de header (`"always"`, `"never"`) no cambian.
- Documentación: aclarado en el README de `HorizontalBarChart` que el
  corte de rótulos largos con "…" solo se activa si se pasa
  `labelLines` (1 o 2) -- sin esa prop, el rótulo se dibuja tal cual,
  sin truncar, por compatibilidad hacia atrás. Agregado un ejemplo
  corto con `labelLines={1}`.

## v0.5.2

- `HorizontalBarChart`: el corte de un rótulo largo con `labelLines`
  truncaba contra `labelWidth` a secas, dejándolo pegado justo donde
  arranca la barra (bug reportado al usar v0.5.1 en la agenda). Ahora
  trunca/envuelve contra `labelWidth - LABEL_BAR_GAP` (4pt), dejando
  siempre un hueco visible antes de la barra.

## v0.5.1

- `ColumnChart`: una columna (modo `stacked`) o una serie (modo
  `overlay`) en 0 ya no muestra el número "0" encima.
- `ColumnChart`: con valores de entrada enteros, el eje Y nunca baja
  de paso 1 (antes podía mostrar pasos fraccionarios como 0,5 con un
  máximo chico).
- `wrapText` (`text-metrics.ts`): una palabra que no entraba ni sola
  en el ancho disponible se dejaba sin truncar y sin "…" -- afectaba a
  `HorizontalBarChart` con `labelLines={2}`, y también a
  `KpiCard.detail` y al título de `ChartCard`, que usan el mismo
  helper.

## v0.5.0

- Contraste de tokens: `textMuted` y `distritoText` recalculados para
  cumplir 4,5:1 contra sus fondos reales; nuevo `colors.neutral` para
  "Otras"/agregados en gráficos.
- `PdfPage` con `header="afterFirstPage"`: la barra fina del header ya
  no deja texto extraíble en la hoja 1 (antes la tapaba con un
  rectángulo blanco, pero el texto seguía ahí).
- Medición real de texto (`text-metrics.ts`, con `fontkit`) para los
  componentes de gráficos -- nunca por cantidad de caracteres.
- Componentes de gráficos nuevos: `StackedBar`, `ColumnChart`,
  `ChartCard`/`ChartGrid`; `HorizontalBarChart` extendido (`color`,
  `sortBy`, `maxItems`/"Otras", `labelLines`, `max`) compatible hacia
  atrás; `KpiCard` con `detail`.
- Saneamiento de números (`toSafeNumber`/`toSafeChartNumber`) en los
  componentes existentes y en los gráficos nuevos.
