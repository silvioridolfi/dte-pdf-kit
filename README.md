# dte-pdf-kit

Kit de diseño PDF del DTE para [`@react-pdf/renderer`](https://react-pdf.org/):
tokens, tipografía y componentes reutilizables entre apps con identidad
DTE (navy / magenta / teal, header con el degradé de marca, footer con
el logo institucional, Encode Sans embebida). Cualquier informe PDF se
arma **solo** con lo que exporta este paquete -- ningún informe define
su propio color, tamaño de fuente, degradé de header/footer o estilo
de tabla. Si hace falta algo que el kit no tiene todavía, se agrega
**acá** (versión nueva del paquete), nunca copiado y pegado adentro de
la app que lo consume.

## Instalación

El repo es público y el paquete se instala por HTTPS fijado por tag:

```json
"dte-pdf-kit": "git+https://github.com/silvioridolfi/dte-pdf-kit.git#v0.5.0"
```

en el `package.json` (nunca SSH ni el atajo `github:`, que pnpm
reescribe al agregarlo). Con pnpm 10 o posterior hay que permitir su
build: en `pnpm-workspace.yaml`,

```yaml
onlyBuiltDependencies: [dte-pdf-kit] # pnpm 10
```

o `allowBuilds` con la clave
`dte-pdf-kit@git+https://github.com/silvioridolfi/dte-pdf-kit.git`:
`true` (pnpm 12 -- verificado con pnpm 12.3.4).

`@react-pdf/renderer` y `react` son `peerDependencies` -- la app que
instala el kit ya los tiene como dependencias propias (16.x/19.x).

No hay paso de build manual: `npm install`/`pnpm install` dispara el
script `prepare` del paquete, que compila `dist/` solo (ver "Cómo
funciona el build" más abajo).

## Ejemplo mínimo de un reporte

```tsx
import { renderToBuffer } from '@react-pdf/renderer'
import { PdfPage, ReportTitle, SectionTitle, KpiCard, DataTable } from 'dte-pdf-kit'

type Alumno = { id: string; nombre: string; equipos: number }

function MiReportePDF({ alumnos }: { alumnos: Alumno[] }) {
  return (
    <PdfPage>
      <ReportTitle
        eyebrow="GRUPO 1"
        title="Informe de cierre"
        meta={[
          { label: 'Período', value: 'Marzo - Noviembre 2026' },
          { label: 'Generado', value: '16/11/2026' },
        ]}
      />

      <SectionTitle>Resumen</SectionTitle>
      <KpiCard value={alumnos.length} label="Alumnos" columns={3} variant="navy" />

      <SectionTitle>Detalle por alumno</SectionTitle>
      <DataTable
        columns={[
          { key: 'nombre', header: 'Alumno', width: '70%' },
          { key: 'equipos', header: 'Equipos', width: '30%', align: 'right', render: (a) => <>{a.equipos}</> },
        ]}
        rows={alumnos}
        keyFor={(a) => a.id}
      />
    </PdfPage>
  )
}

const buffer = await renderToBuffer(<MiReportePDF alumnos={alumnos} />)
```

Un informe de varias páginas es simplemente más de un `<PdfPage>`
dentro del documento `<Document>` de `@react-pdf/renderer`; el header
y el footer institucionales se repiten solos en cada uno.

## Componentes

### Tokens (`tokens.ts`)

Única fuente de verdad para colores, tipografía y medidas. No
hardcodear ningún valor de diseño fuera de acá.

- `colors` -- paleta completa (navyDeep `#033650`, navy `#06466E`,
  magenta `#CD1E6D`, teal `#17A8C6`, fondos, bordes, texto, oro/plata/
  bronce, semáforo success/warning/danger). `textMuted` y
  `distritoText` están pensados para cumplir 4,5:1 de contraste contra
  sus fondos reales (ver el comentario arriba de `colors` en
  `tokens.ts` para los números exactos y la fórmula WCAG usada);
  `neutral` (`#7B8794`, 3,66:1 sobre blanco) es el color fijo de
  "Otras"/agregados en los gráficos, no un color de texto.
- `fontFamily` -- `'Encode Sans'`.
- `weight` -- `light` (300) a `extraBold` (800).
- `type` -- estilos de texto listos (`h1`, `h2`, `body`, `label`,
  `cardTitle` -- título de `ChartCard`, bold 9pt).
- `pageMargins`, `header`, `footer`, `kpi`, `chartCard`,
  `titleDividerWidth` -- medidas de layout, ya en puntos.
- `chartPalette` -- 5 colores para series de gráficos (navy, magenta,
  teal, skyLight, navyDeep, en ese orden); `chartColor(índice)` la
  recorre y, desde la 6ª serie, repite el ciclo aclarado 60% con
  `tint()`. **Se recomienda un máximo de 4 series** por gráfico --
  navy y navyDeep tienen muy poco contraste entre sí (1,28:1); la 5ª
  es el último recurso. `chartContour(color)`/`chartNeedsContour(color)`
  dan el contorno de 0,5pt que los componentes de gráficos agregan
  solos a `skyLight` y a los colores del segundo ciclo en adelante
  (contraste insuficiente como para depender solo del color).
- `mm(value)` -- convierte milímetros a puntos.
- `A4_MM` -- `{ width: 210, height: 297 }`.
- `gradientBrand` -- el único degradé del kit: navyDeep -> navy (45%)
  -> magenta, a 135° (convención CSS). `gradientLineCoords(width,
  height, angleDeg?)` calcula las coordenadas `userSpaceOnUse` que
  reproducen ese ángulo en un `<Svg>` de cualquier relación de
  aspecto (el degradé por defecto de SVG no da el mismo ángulo que
  uno de CSS en una caja que no es cuadrada). `BrandGradientDef({ id,
  width, height })` arma el `<Defs><LinearGradient>...` listo para
  usar -- es lo que usan `PdfPage`, `ReportTitle` y `SectionTitle`
  internamente, y lo que usa cualquier componente nuevo que necesite
  el mismo degradé.

### `PdfPage`

Página A4 con el header (degradé de marca del DTE, "DTE" + nombre de
la dirección) y el footer institucional fijos. Es el único lugar
donde un reporte nuevo toca `<Page>` -- todo lo demás va adentro.

```ts
PdfPage({
  children: ReactNode,
  orientation?: 'portrait' | 'landscape',   // default 'portrait'
  headerTitle?: string,                      // default 'Dirección de Tecnología Educativa'
  headerSubtitle?: string,                   // default 'Prácticas Educativas en Ambientes de Trabajo'
  header?: 'always' | 'afterFirstPage' | 'never',   // default 'always'
  footerText?: string,                       // sin default -- ver abajo
})
```

`headerTitle`/`headerSubtitle` permiten que otra app del DTE use su
propio nombre de dirección/programa en la banda del header sin tocar
el degradé, el logo ni la estructura.

`header` controla cuándo aparece la banda fina: `"always"` (default)
en todas las hojas, `"afterFirstPage"` a partir de la segunda, o
`"never"`. Un informe que arranca con `ReportHero` usa
`"afterFirstPage"` -- la primera hoja ya tiene su propia banda grande,
y de la segunda en adelante (si la tabla no entra en una sola hoja)
vuelve la banda fina como encabezado de continuación.

`footerText` cambia el pie institucional: sin pasarlo, el pie queda
como siempre (logo centrado + numeración). Con un valor, el pie pasa
a ser una sola fila -- texto a la izquierda, logo y numeración juntos
a la derecha -- pensada para los informes armados con `ReportHero`
(que ya no trae su propio pie, para que el logo no se repita en la
misma hoja). Ver "Reportes de una página o apaisados con ReportHero"
más abajo.

### `ReportHero`

Header grande para informes de **una sola página o apaisados** (ej.
un cronograma), como primer hijo de `<PdfPage>` en vez de
`ReportTitle`: banda con el degradé de marca, eyebrow + título en
blanco a la izquierda y el logo institucional en su versión blanca a
la derecha; debajo, una fila de datos y un aviso opcional.

```ts
ReportHero({
  eyebrow?: string,
  title: string,
  titleLines?: 1 | 2,                // default 1
  meta?: { label: string; value: string }[],
  notice?: string,
  orientation?: 'portrait' | 'landscape',   // default 'portrait' -- tiene que coincidir con el de <PdfPage>
})
```

No hay ningún valor por defecto propio de otro proyecto: `eyebrow`,
`titleLines`, `meta` y `notice` son opcionales y quedan en su default
o vacíos si no se pasan; `title` es obligatorio. Lo único fijo entre
apps es el degradé, el logo blanco y Encode Sans.

`title` tiene que entrar en `titleLines` líneas (1 por defecto, hasta
2) para el ancho disponible (igual que el H1 de `ReportTitle`) -- si
no entra, se trunca con "..." recién después de agotar esas líneas,
nunca antes ni superponiéndose al logo (la banda crece sola para darle
lugar real a la segunda línea cuando `titleLines={2}`).

> **`footerText` en `ReportHero` está deprecado.** `ReportHero` ya no
> renderiza su propio pie (duplicaba el logo institucional con el de
> `PdfPage`) -- si se sigue pasando, se ignora sin romper el build.
> Pasá `footerText` a `<PdfPage>` en su lugar, como en el patrón de
> abajo.

### Reportes de una página o apaisados con ReportHero

El patrón completo es `<PdfPage header="afterFirstPage" footerText="...">`
con `<ReportHero>` como primer hijo (sin `footerText`): la primera
hoja tiene solo la banda grande de `ReportHero` + el pie de una fila
de `PdfPage`; si el contenido no entra en una hoja, de la segunda en
adelante aparece la banda fina de `PdfPage` como encabezado, con el
mismo pie en todas.

**Vertical:**

```tsx
<PdfPage header="afterFirstPage" footerText="Mi App · Resumen semanal">
  <ReportHero
    title="Resumen semanal"
    meta={[{ label: 'Semana', value: '17 al 21 de noviembre' }]}
  />
  {/* ...el resto del informe */}
</PdfPage>
```

**Apaisado** (nota el mismo `orientation` en `PdfPage` y en `ReportHero`):

```tsx
<PdfPage
  orientation="landscape"
  header="afterFirstPage"
  footerText="Agenda Territorial · Cronograma de reparaciones e instalaciones"
>
  <ReportHero
    eyebrow="Región 1"
    title="Cronograma de reparaciones e instalaciones"
    orientation="landscape"
    meta={[
      { label: 'Distrito', value: 'Ensenada' },
      { label: 'Período', value: '18/11/2026 al 22/11/2026' },
      { label: 'Emitido', value: '17/11/2026' },
    ]}
    notice="el cronograma puede reprogramarse por disponibilidad de las escuelas."
  />
  {/* ...el resto del informe, ej. un <DataTable> largo */}
</PdfPage>
```

### `ReportTitle`

Bloque de título: etiqueta opcional ("GRUPO 1"), H1, chips de
metadata y una línea divisoria con un tramo del degradé de marca.

```ts
ReportTitle({
  eyebrow?: string,
  title: string,
  meta: { label: string; value: string }[],
  note?: string,
})
```

### `SectionTitle`

H2 de sección con la barrita vertical de degradé a la izquierda.

```ts
SectionTitle({ children: ReactNode })
```

### `KpiCard` / `KpiGrid`

Tarjeta de indicador (número grande + label + barra de progreso
opcional) y el contenedor que las hace envolver (`flexWrap`) con el
espaciado estándar.

```ts
KpiGrid({ children: ReactNode })

KpiCard({
  value: string | number,
  label: string,
  columns: 3 | 6,                 // también define el tamaño del número
  variant?: 'navy' | 'magenta' | 'teal' | 'oro' | 'plata' | 'bronce', // default 'navy'
  progress?: number,              // 0-100, si se quiere la barra
  progressVariant?: 'navy' | 'magenta' | 'teal',
  detail?: string,                // línea chica debajo del label, envuelve 2 líneas y trunca
  orientation?: 'portrait' | 'landscape', // default 'portrait' -- para estimar el ancho real de `detail`
})
```

`KpiGrid` estira todas las tarjetas de una misma fila (la que envuelve
`flexWrap`) a la altura de la más alta -- es el `alignItems: 'stretch'`
por defecto de Yoga, no hace falta pedirlo.

Los valores numéricos (`value` cuando es `number`, `progress`) pasan
por `toSafeNumber` (ver "Números seguros" más abajo): un `NaN` o un
`Infinity` nunca terminan mostrándose literalmente en un informe.

### `ProgressBar`

Barra de progreso simple (track + relleno redondeado).

```ts
ProgressBar({
  value: number,                  // 0-100, se recorta solo
  variant?: 'navy' | 'magenta' | 'teal', // default 'navy'
  height?: number,                 // default 4
})
```

### `StatusChips`

Desglose por estado: barra apilada proporcional + un chip por estado
con su cantidad ("done"/"derived" rellenos, "pending" con acento
teal).

```ts
StatusChips({
  items: { key: string; label: string; count: number; kind: 'done' | 'derived' | 'pending' }[],
})
```

### `DataTable`

Tabla genérica: header navy con esquinas redondeadas (se repite solo
en cada página si la tabla no entra entera), filas con zebra clarito.
Cada columna define su propio render de celda. Cada columna tiene un
gutter horizontal fijo (no hay que pasarlo) para que el texto de una
celda no toque el de la siguiente.

```ts
DataTable<T>({
  columns: {
    key: string
    header: string
    width: number | string        // pt, o string en "%"
    align?: 'left' | 'center' | 'right'
    render: (row: T) => ReactNode
  }[],
  rows: T[],
  keyFor: (row: T) => string,
  density?: 'default' | 'compact',   // default 'compact'
})
```

`density="compact"` es el valor por defecto desde que existe el
gutter entre columnas -- filas más bajas que compensan el espacio
nuevo, para que agregar el gutter no aumente la cantidad de páginas de
una tabla larga. `"default"` es el alto de fila que tenía el kit antes
del gutter, por si una tabla puntual lo necesita más espaciada.

### Celdas (`cells.tsx`)

Celdas especiales para usar en el `render` de una columna de
`DataTable`:

- `DistritoPill({ children: string })` -- píldora celeste en
  mayúsculas, para un dato geográfico/categórico corto.
- `CantidadCell({ value: number; max: number })` -- número + mini
  barra proporcional al máximo de la tabla (alias: `EquiposCell`).
- `DestacarSiPositivoCell({ value: number })` -- magenta y negrita si
  es mayor a 0, apagado si es 0 (alias: `DerivCell`).
- `RankBadge({ rank: number })` -- círculo numerado (1° magenta, 2°
  navy, 3° teal, resto gris).
- `PorcentajeCell({ pct: number; umbral?: number })` -- porcentaje +
  mini barra, navy si llega al umbral (75% por defecto) o más,
  magenta si no (alias: `AsistenciaCell`).
- `PuntosCell({ total: number | string; detail?: string })` -- número
  grande + detalle chico opcional debajo.
- `Chips({ items: string[]; special?: string })` -- lista de chips,
  con una variante especial por nombre; `"--"` si está vacía (alias
  con la variante especial fija en "Asistencia perfecta":
  `InsigniaChips({ items: string[] })`).
- `TituloConDetalleCell({ titulo: string; detail?: string })` -- dos
  líneas: título en negrita y, debajo, un detalle chico en gris (ej.
  nombre de escuela + `` `CUE ${cue} · ${direccion}` ``).
  `DataTable` ya acepta cualquier `ReactNode` por celda, así que esto
  es solo el armado visual estándar del kit para ese caso.

### Gráficos

Todos dibujados a mano con primitivas de SVG -- `@react-pdf/renderer`
no trae un componente de gráficos. Comparten reglas: series como
`{ key, label, color? }` (color de `chartColor(índice)` si no viene),
números formateados con `toLocaleString('es-AR')` (enteros si toda la
serie es entera) salvo que se pase `format`, `emptyText` ("Sin datos"
por defecto) cuando no hay datos o todos los valores son 0, y un ancho
resuelto con esta prioridad: `width` explícito > ancho interior de un
`ChartCard` que los contenga > ancho útil de página según
`orientation`/`size`. Los labels largos se truncan o envuelven siempre
con medición real de texto (`text-metrics.ts`), nunca estimando por
cantidad de caracteres.

#### `HorizontalBarChart`

Barras horizontales, para una comparación rápida de pocos valores (ej.
taller vs. territorio).

```ts
HorizontalBarChart({
  bars: { label: string; value: number; variant?: 'navy' | 'magenta' | 'teal'; color?: string }[],
  width?: number,       // default 460 (o el ancho resuelto si hay orientation/size/ChartCard)
  barHeight?: number,   // default 13
  gap?: number,         // default 9
  labelWidth?: number,  // default 92
  valueWidth?: number,  // default 36
  sortBy?: 'none' | 'value-desc' | 'value-asc', // default 'none', orden estable
  maxItems?: number,    // agrupa el resto en una barra "Otras" al final
  otherLabel?: string,  // default 'Otras'
  otherColor?: string,  // default colors.neutral
  labelLines?: 1 | 2,   // trunca o envuelve el label -- sin pasarlo, no se toca (compatible hacia atrás)
  max?: number,         // escala compartida -- sin pasarlo, usa el máximo de los valores mostrados
  orientation?: 'portrait' | 'landscape',
  size?: 'full' | 'half',
  format?: (n: number) => string,
  emptyText?: string,
})
```

Sin ninguno de los props nuevos, el resultado es idéntico al de antes
de la v0.5.0 -- los tres informes de bitacora-pp que ya lo usan no se
mueven ni un píxel.

#### `StackedBar`

Una barra de un solo total, segmentada, con la leyenda siempre debajo
(nunca al costado). Puntas redondeadas solo en los extremos externos
de la barra, nunca entre segmentos.

```ts
StackedBar({
  segments: { key: string; label: string; value: number; color?: string }[],
  legendValue?: 'value' | 'percent' | 'both' | 'none', // default 'both'
  gap?: number,          // default 1, entre segmentos
  barHeight?: number,    // default 18
  roundToTotal?: boolean, // redondea los % de la leyenda por "resto mayor" para que sumen 100
  width?: number,
  orientation?: 'portrait' | 'landscape',
  size?: 'full' | 'half',
  format?: (n: number) => string,
  emptyText?: string,
})
```

Un segmento en 0 aparece en la leyenda (ej. "Pendiente 0 (0%)") pero no
se dibuja en la barra, mientras algún otro segmento sea mayor a 0.

#### `ColumnChart`

Columnas apiladas (`mode="stacked"`, default) o superpuestas
(`mode="overlay"`) sobre un eje vertical con ticks "redondos" (pasos
de 1, 2 o 5 x 10ⁿ). Los labels del eje X se acomodan solos:
horizontales si entran, inclinados 45° si así entran, o inclinados con
salteo (conservando siempre el primero y el último) si ni así entran.

```ts
ColumnChart({
  series: { key: string; label: string; color?: string }[],
  data: { label: string; values: Record<string, number> }[],
  mode?: 'stacked' | 'overlay',  // default 'stacked'
  plotHeight?: number,            // default 118
  ticks?: number,                 // default 4
  showValues?: boolean,           // default true, solo si el número entra sin desbordar la columna
  showLegend?: boolean,           // default true
  summary?: string[],             // líneas en negrita debajo de la leyenda
  gap?: number,                   // default 2, espacio entre segmentos apilados (solo si el segmento mide >=10pt)
  overlayWidthRatio?: number,     // default 0.56, solo mode="overlay"
  overlayLabelSeries?: string,    // qué serie etiquetar en "overlay" -- default la última
  yLabel?: string,
  width?: number,
  orientation?: 'portrait' | 'landscape',
  size?: 'full' | 'half',
  format?: (n: number) => string,
  emptyText?: string,
})
```

`mode="overlay"` dibuja las series de atrás hacia adelante: la primera
al 100% del ancho de la columna, cada una siguiente a
`overlayWidthRatio` del ancho de la anterior, centrada -- cada una con
su propia altura (no se apilan). Recomendado para 2 o 3 series.

#### `ChartCard` / `ChartGrid`

Tarjeta contenedora para un gráfico (borde fino, mismo radio/padding
que `KpiCard`, título opcional) y la grilla que las hace envolver: dos
`size="half"` por fila, o una `size="full"` ocupando toda la fila.

```ts
ChartCard({
  title?: string,
  children: ReactNode,
  size?: 'full' | 'half',          // default 'full'
  orientation?: 'portrait' | 'landscape', // default 'portrait'
})

ChartGrid({ children: ReactNode })
```

Un gráfico puesto adentro de un `ChartCard` sin `width`/`size`/
`orientation` propios toma el ancho interior de la tarjeta solo (vía
`useChartCardWidth()`, expuesto por si se escribe un gráfico nuevo).

```tsx
<ChartGrid>
  <ChartCard title="Taller vs. territorio por mes" size="half">
    <ColumnChart series={series} data={data} />
  </ChartCard>
  <ChartCard title="Distribución del total" size="half">
    <StackedBar segments={segments} />
  </ChartCard>
</ChartGrid>
```

### `Text` / `MultilineText`

`Text` propio del kit (alias `MultilineText`, mismo componente):
fija `fontFamily` siempre, sin dejarlo nunca a cargo de la herencia.
Si el contenido es un string con saltos de línea (`\n`), lo parte acá
mismo y arma cada línea como su propio nodo de texto, en vez de un
`\n` literal adentro de un mismo `<Text>` -- que es donde
`@react-pdf/renderer` puede re-resolver la fuente de la línea nueva
sin heredarla del padre y caer a Helvetica. Se usa en vez del `Text`
de `@react-pdf/renderer` para cualquier párrafo que pueda traer
saltos de línea (el `notice` de `ReportHero` y el cuerpo de `Note` ya
lo usan internamente).

```ts
Text({
  children: ReactNode,     // si es un string con '\n', se parte solo
  style?: Style | Style[],
})
```

### `Note`

Bloque de nota o párrafo final para el cierre de un informe
(aclaraciones, metodología, observaciones): título chico en
mayúsculas (opcional, `"Nota"` por defecto) + párrafo, con
`MultilineText` por debajo.

```ts
Note({
  title?: string,          // default 'Nota'
  children: string,        // puede traer '\n'
})
```

```tsx
<Note title="Nota metodológica">
  {'Las fechas se calculan según la disponibilidad de los equipos de técnicos.\nAnte un imprevisto, contactar a la coordinación regional.'}
</Note>
```

### Medición de texto (`text-metrics.ts`)

Mide el ancho real de un texto en Encode Sans (con `fontkit`, la misma
librería que usa `@react-pdf/renderer` para el shaping, sobre los
mismos TTF que registra `ensureFontsRegistered`) -- nunca por cantidad
de caracteres. La usan los componentes de gráficos para truncar labels
y decidir si rotan el eje X; cualquier componente nuevo que necesite
saber si un texto entra en un ancho dado debería usar esto, no
`texto.length * constante`.

```ts
type TextStyleSpec = { size: number; weight: number }

textWidth(text: string, style: TextStyleSpec): number
fitsInWidth(text: string, maxWidth: number, style: TextStyleSpec): boolean
fitText(text: string, maxWidth: number, style: TextStyleSpec): { text: string; truncated: boolean }
wrapText(text: string, maxWidth: number, style: TextStyleSpec, maxLines: number): { lines: string[]; truncated: boolean }
labelLayout(labels: string[], slotWidth: number, style: TextStyleSpec, opts?: { minGap?: number }): { rotation: 0 | 45; step: number; reservedHeight: number; reservedLeft: number }
```

`textWidth` coincide con el ancho que efectivamente dibuja
`@react-pdf/renderer` con menos de 0,01% de error (verificado
extrayendo los bounding boxes reales de un PDF generado, con
`pdftotext -bbox`, ver `tests/text-metrics.test.mjs`). La decisión de
wrap de Yoga dentro de un contenedor de ancho fijo tiene su propio
margen interno de hasta ~3% del ancho del texto -- `textWidth` siempre
sobrestima en el sentido seguro (trunca un poco antes de lo
estrictamente necesario, nunca se desborda).

### Números seguros (`numbers.ts`)

```ts
toSafeNumber(value: unknown): number       // NaN/Infinity/-Infinity/null/undefined -> 0, negativos válidos se conservan
toSafeChartNumber(value: unknown): number  // además recorta negativos a 0
```

`toSafeNumber` es lo que usan los componentes existentes (`ProgressBar`,
`StatusChips`, `CantidadCell`, `PorcentajeCell`,
`DestacarSiPositivoCell`, `PuntosCell`, `RankBadge`, `KpiCard`) para
nunca terminar mostrando literalmente `"NaN"`/`"Infinity"` en un
informe, conservando un negativo válido (puede tener sentido, ej. una
diferencia contra la etapa anterior). `toSafeChartNumber` es lo que
usan los componentes de gráficos (`StackedBar`, `HorizontalBarChart`,
`ColumnChart`), donde un valor negativo no tiene una representación
razonable en una barra o columna.

### Fuentes (`fonts.ts`)

`ensureFontsRegistered()` registra Encode Sans (300 a 800) una sola
vez por proceso y desactiva la hyphenation automática de
`@react-pdf/renderer`. Se llama sola al importar `PdfPage` -- un
reporte normal no necesita invocarla a mano.

## Cómo agregar un reporte nuevo

1. Armar el componente del reporte con un único `<PdfPage>` (o varios,
   uno por cada bloque de páginas) como raíz, usando `ReportTitle`,
   `SectionTitle`, `KpiCard`/`KpiGrid`, `StatusChips`, `DataTable` y
   las celdas de `cells.tsx` para todo el contenido. No definir estilos
   propios de color, fuente, margen o header/footer -- si falta algo,
   es una señal de que el kit necesita un componente o una variante
   nueva, no un estilo suelto en el reporte.
2. Si una tabla necesita un tipo de celda que no existe todavía,
   agregarlo a `cells.tsx` (en este repo, no copiado en la app) y
   publicar una versión nueva del paquete.
3. Renderizar con `renderToBuffer`/`renderToStream` de
   `@react-pdf/renderer`, como cualquier documento de la librería --
   el kit no envuelve esa parte.
4. Antes de dar por terminado el reporte: generarlo, convertirlo a
   imagen (ej. `pdftoppm -png -r 150`) y revisar que no haya texto
   cortado ni tablas rotas entre páginas; confirmar con `pdffonts` que
   Encode Sans quedó embebida (`emb yes`).

## Tests

```bash
npm test
```

Corre con el test runner nativo de Node (`node --test`), sin sumar un
framework de testing nuevo. Compila primero (`pretest`) y bundlea con
`esbuild` los fixtures `.tsx` de `tests/fixtures/` a `.mjs` (hace falta
porque `node --test` no trae loader de TSX, y `tsx` no puede cargar
`@react-pdf/renderer`). Los tests que dependen de `pdftotext`/
`pdffonts`/`pdfinfo` (poppler-utils) se saltan solos si el binario no
está instalado, en vez de fallar.

## Cómo funciona el build

El paquete se instala vía `github:silvioridolfi/dte-pdf-kit`, así que
tiene que funcionar sin que quien lo instala corra un build a mano.
Se eligió **compilar en el `prepare` script de npm** (en vez de
commitear `dist/` al repo) porque:

> `prepare` corre automáticamente en cada `npm install` de una
> dependencia de git -- es la forma nativa de npm de pedir un build
> post-instalación, evita el riesgo de que `dist/` quede
> desincronizado de `src/` en un commit, y ya se verificó que funciona
> (`npm install` sobre un clone limpio del repo corre `build:assets` +
> `tsc` solo y deja `dist/` listo).

Las fuentes (Encode Sans, 6 pesos TTF) y el logo institucional viajan
embebidos como `data:` URLs en `src/generated-assets.ts` (generado por
`npm run build:assets` a partir de los binarios en `assets/`) en vez
de como rutas de archivo: una ruta de archivo depende de que el
bundler de quien consume el paquete (ej. Next.js en Vercel) detecte y
empaquete ese archivo en la función serverless, y con un paquete
externo cargado por ruta dinámica ese tracing puede fallar en
silencio. Una `data:` URL viaja embebida en el JS compilado, sin
ninguna dependencia de archivos en runtime -- ya probado con
`@react-pdf/font` (fuentes) y `@react-pdf/image` (logo).

Para cambiar una fuente o el logo: reemplazar el binario en `assets/`
y correr `npm run build:assets` (o `npm run build`) de nuevo -- nunca
editar `src/generated-assets.ts` a mano.
