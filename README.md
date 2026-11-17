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

El paquete se instala directo desde GitHub:

```bash
npm install github:silvioridolfi/dte-pdf-kit
```

`@react-pdf/renderer` y `react` son `peerDependencies` -- la app que
instala el kit ya los tiene como dependencias propias (16.x/19.x).

No hay paso de build manual: `npm install` dispara el script
`prepare` del paquete, que compila `dist/` solo (ver "Cómo funciona
el build" más abajo).

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
  bronce, semáforo success/warning/danger).
- `fontFamily` -- `'Encode Sans'`.
- `weight` -- `light` (300) a `extraBold` (800).
- `type` -- estilos de texto listos (`h1`, `h2`, `body`, `label`).
- `pageMargins`, `header`, `footer`, `kpi`, `titleDividerWidth` --
  medidas de layout, ya en puntos.
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
la dirección) y el footer (logo institucional + numeración "N /
total") fijos en todas las páginas. Es el único lugar donde un
reporte nuevo toca `<Page>` -- todo lo demás va adentro.

```ts
PdfPage({
  children: ReactNode,
  orientation?: 'portrait' | 'landscape',   // default 'portrait'
  headerTitle?: string,                      // default 'Dirección de Tecnología Educativa'
  headerSubtitle?: string,                   // default 'Prácticas Educativas en Ambientes de Trabajo'
})
```

`headerTitle`/`headerSubtitle` permiten que otra app del DTE use su
propio nombre de dirección/programa en la banda del header sin tocar
el degradé, el logo ni la estructura.

### `ReportHero`

Header grande para informes de **una sola página o apaisados** (ej.
un cronograma), como primer hijo de `<PdfPage>` en vez de
`ReportTitle`: banda con el degradé de marca, eyebrow + título en
blanco a la izquierda y el logo institucional en su versión blanca a
la derecha; debajo, una fila de datos, un aviso opcional y un pie
propio del bloque (texto + logo en color). El header fino y el footer
institucional de `PdfPage` (logo centrado + numeración de página)
siguen existiendo igual, sin cambios, para los informes largos.

```ts
ReportHero({
  eyebrow?: string,
  title: string,
  meta?: { label: string; value: string }[],
  notice?: string,
  footerText: string,               // nombre de la app y del reporte -- obligatorio, sin default
  orientation?: 'portrait' | 'landscape',   // default 'portrait' -- tiene que coincidir con el de <PdfPage>
})
```

No hay ningún valor por defecto propio de otro proyecto: `eyebrow`,
`meta` y `notice` son opcionales y quedan vacíos si no se pasan;
`title` y `footerText` son obligatorios. Lo único fijo entre apps es
el degradé, los logos (blanco en la banda, en color en el pie) y
Encode Sans.

`title` tiene que entrar en una línea para el ancho disponible (igual
que el H1 de `ReportTitle`) -- si no entra, se trunca con "..." en vez
de superponerse al logo.

**Ejemplo mínimo, vertical:**

```tsx
<PdfPage>
  <ReportHero
    title="Resumen semanal"
    meta={[{ label: 'Semana', value: '17 al 21 de noviembre' }]}
    footerText="Mi App · Resumen semanal"
  />
</PdfPage>
```

**Ejemplo mínimo, apaisado** (nota el mismo `orientation` en los dos):

```tsx
<PdfPage orientation="landscape">
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
    footerText="Agenda Territorial · Cronograma de reparaciones e instalaciones"
  />
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
})
```

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
Cada columna define su propio render de celda.

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
})
```

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

### `HorizontalBarChart`

Barras horizontales dibujadas a mano con SVG, para una comparación
rápida de pocos valores (ej. taller vs. territorio).

```ts
HorizontalBarChart({
  bars: { label: string; value: number; variant?: 'navy' | 'magenta' | 'teal' }[],
  width?: number,       // default 460
  barHeight?: number,   // default 13
  gap?: number,         // default 9
  labelWidth?: number,  // default 92
  valueWidth?: number,  // default 36
})
```

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
