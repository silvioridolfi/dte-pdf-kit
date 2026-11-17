/**
 * Kit de diseño PDF del DTE -- tokens.
 *
 * Única fuente de verdad para colores, tipografía y medidas de los
 * informes en PDF (@react-pdf/renderer). Ningún componente de este kit,
 * y ningún informe que lo use, debería tener un color o un tamaño
 * hardcodeado -- todo sale de acá, para que cambiar la identidad visual
 * del DTE sea editar un solo archivo.
 */

/** 1mm en puntos (unidad nativa de @react-pdf/renderer, 72pt = 1 pulgada). */
export const PT_PER_MM = 2.8346456693

/** Convierte milímetros a puntos -- todas las medidas del kit se definen
 * en mm y se convierten acá, para poder pensar el layout en la misma
 * unidad en la que viene especificado el diseño. */
export function mm(value: number): number {
  return value * PT_PER_MM
}

/** Ancho/alto de A4 en mm. */
export const A4_MM = { width: 210, height: 297 }

/**
 * Contraste mínimo exigido: 4,5:1 para texto (WCAG AA), 3:1 para
 * elementos gráficos. Valores medidos con la fórmula de contraste de
 * WCAG 2.x (luminancia relativa de cada color, (L1+0,05)/(L2+0,05)):
 *
 * - `textMuted` (antes `#8A9AA8`, 2,89:1 sobre blanco / 2,68:1 sobre
 *   `cardBg`) pasa a `#617281`: 4,96:1 sobre blanco, 4,60:1 sobre
 *   `cardBg`. Queda cerca de `textSecondary` (5,42:1 / 5,02:1) -- la
 *   jerarquía entre los dos pasa a depender del tamaño y el peso del
 *   texto, no del tono.
 * - `distritoText` (antes `#3E7E96`, 4,54:1 sobre blanco / 4,20:1
 *   sobre `cardBg` / 4,02:1 sobre `distritoBg`, su fondo real) pasa a
 *   `#2F6F87`: 5,61:1 / 5,20:1 / 4,97:1 respectivamente.
 * - `neutral` (nuevo, ver `chartPalette`) es `#7B8794`: 3,66:1 sobre
 *   blanco -- cumple el mínimo de 3:1 para objetos gráficos, no el de
 *   4,5:1 de texto, así que no se usa para texto de lectura.
 */
export const colors = {
  navyDeep: '#033650',
  navy: '#06466E',
  magenta: '#CD1E6D',
  teal: '#17A8C6',

  cardBg: '#F2F7FA',
  border: '#DDE6ED',
  borderSoft: '#E3EBF1',
  trackBg: '#E7EFF5',
  rowZebra: '#F8FBFD',

  text: '#1B2B3A',
  textSecondary: '#5B6C7B',
  textMuted: '#617281',
  white: '#FFFFFF',

  distritoBg: '#E4F4F8',
  distritoText: '#2F6F87',

  // Reservado para "Otras"/agregados en los gráficos (`chartPalette`
  // no lo incluye) -- 3,66:1 sobre blanco, no para texto de lectura.
  neutral: '#7B8794',

  // Celeste claro para texto chico sobre el degradé de marca (ej. el
  // eyebrow de ReportHero) -- sobre navyDeep/navy el magenta y el teal
  // no tienen contraste suficiente para un texto en mayúsculas chico.
  skyLight: '#8FD6E5',

  insigniaBg: '#E4EEF5',
  asistenciaPerfectaBg: '#FCE3EF',

  oroBg: '#FDF3D8',
  oroAccent: '#C79A1E',
  oroText: '#8A6A12',
  plataBg: '#EEF0F3',
  plataAccent: '#8E99A6',
  plataText: '#515C68',
  bronceBg: '#F7E9DA',
  bronceAccent: '#B45309',
  bronceText: '#8A3F07',

  // Semáforo genérico (ej. presente/tardanza/ausente en un informe de
  // asistencia) -- no es parte de la paleta de marca del DTE pero vive
  // acá igual para que ningún informe lo hardcodee por su cuenta.
  success: '#1F9D5A',
  successBg: '#E3F6EA',
  warning: '#F97316',
  warningBg: '#FFF1E0',
  danger: '#C0392B',
  dangerBg: '#FBE4E1',
  neutralStatus: '#999999',
  neutralStatusBg: '#F2F2F2',
} as const

export const fontFamily = 'Encode Sans'

export const weight = {
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
} as const

export const type = {
  h1: { fontFamily, fontWeight: weight.extraBold, fontSize: 21, color: colors.navy },
  h2: { fontFamily, fontWeight: weight.bold, fontSize: 11.5, color: colors.navy },
  body: { fontFamily, fontWeight: weight.regular, fontSize: 9, color: colors.text },
  label: { fontFamily, fontWeight: weight.medium, fontSize: 7, color: colors.textSecondary },
  /** Título de `ChartCard` -- más chico y menos marcado que `h2` (que
   * es para títulos de sección), en `colors.text` en vez de navy. */
  cardTitle: { fontFamily, fontWeight: weight.bold, fontSize: 9, color: colors.text },
} as const

/** Márgenes de página: arriba/abajo reservan lugar para el header y el
 * footer fixed, laterales son el margen de contenido. */
export const pageMargins = {
  top: mm(29),
  bottom: mm(28),
  side: mm(15),
}

export const header = {
  top: mm(8),
  height: mm(13),
  radius: mm(3),
}

export const footer = {
  logoHeight: mm(11),
  logoBottom: mm(9),
  pageNumberBottom: mm(11),
}

/** Relación ancho/alto real de los logos institucionales (PNG), para
 * no deformarlos sea cual sea el alto que se les dé. */
export const FOOTER_LOGO_RATIO = 1400 / 193
export const HERO_LOGO_WHITE_RATIO = 1200 / 166

export const kpi = {
  radius: mm(2.5),
  accentWidth: mm(1.2),
}

export const titleDividerWidth = mm(28)

/** Medidas de `DataTable`: `cellGutter` separa el texto de una columna
 * del de la siguiente (antes no había nada entre columnas); `density`
 * define el alto de fila -- `compact` es el valor por defecto desde
 * que existe el gutter, para que agregarlo no infle la cantidad de
 * páginas de una tabla larga. */
export const table = {
  cellGutter: 3,
  density: {
    default: { rowPaddingVertical: 4 },
    compact: { rowPaddingVertical: 2.5 },
  },
}

/** Medidas de `ChartCard`: mismo radio y padding que `KpiCard`, más un
 * borde fino (KpiCard no tiene borde, usa una franja de acento) y el
 * espacio entre tarjetas de `ChartGrid`. */
export const chartCard = {
  borderWidth: 0.75,
  padding: 8,
  radius: kpi.radius,
  gap: 8,
}

/** Medidas de `ReportHero`: la banda grande (degradé + eyebrow + título
 * + logo blanco) para informes de una página o apaisados, y la fila de
 * pie propia del bloque (texto + logo en color). */
export const hero = {
  height: mm(22),
  // Alto extra que suma la banda cuando ReportHero usa titleLines={2}
  // -- el alto base (height) solo tiene lugar para una línea de
  // título.
  twoLineExtraHeight: mm(9),
  radius: mm(3),
  paddingX: mm(7),
  paddingY: mm(5),
  logoHeight: mm(9.5),
  footerLogoHeight: mm(9),
  titleFontSize: 18,
  titleLineHeightFactor: 1.15,
}

/**
 * Ancho útil de la página (A4 menos los márgenes laterales) para una
 * orientación dada, en puntos. Es el mismo cálculo que usa `PdfPage`
 * para la banda del header fino -- cualquier componente que necesite
 * saber cuánto espacio horizontal tiene disponible (ej. `ReportHero`)
 * lo pide acá en vez de reconstruir la cuenta por su cuenta.
 */
export function contentWidth(orientation: 'portrait' | 'landscape' = 'portrait'): number {
  const widthMm = orientation === 'landscape' ? A4_MM.height : A4_MM.width
  return mm(widthMm) - 2 * pageMargins.side
}

/**
 * Degradé de marca del DTE: oscuro (navyDeep) -> navy al 45% -> magenta,
 * en un ángulo de 135° (convención CSS: 0° = hacia arriba, clockwise --
 * 135° apunta hacia abajo a la derecha). Es el único degradé del kit --
 * banda del header, línea bajo el título, barrita de los H2 -- para que
 * cambiar la identidad visual sea editar esto una sola vez.
 *
 * Referencia: el degradé de la Agenda Territorial DTE, medido como
 * `linear-gradient(135deg, #033650 0%, #06466E 45%, #CD1E6D 100%)`.
 */
export const gradientBrand = {
  angle: 135,
  stops: [
    { offset: 0, color: colors.navyDeep },
    { offset: 0.45, color: colors.navy },
    { offset: 1, color: colors.magenta },
  ],
} as const

/**
 * Coordenadas (en userSpaceOnUse, mismas unidades que el `<Svg>` que lo
 * contiene) de la línea de un degradé lineal estilo CSS para una caja de
 * `width` x `height` y un ángulo en grados (convención CSS). El degradé
 * por defecto de SVG (`objectBoundingBox`, 0..1 en cada eje por
 * separado) no da el mismo resultado que un `linear-gradient` de CSS en
 * una caja que no es cuadrada -- esto replica el algoritmo real de CSS
 * (longitud de la línea = |width*sin(ángulo)| + |height*cos(ángulo)|,
 * centrada en el centro de la caja) para que el ángulo se vea igual sea
 * cual sea la relación de aspecto del `<Svg>`.
 */
export function gradientLineCoords(width: number, height: number, angleDeg: number = gradientBrand.angle) {
  const rad = (angleDeg * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = -Math.cos(rad)
  const halfLength = (Math.abs(width * dx) + Math.abs(height * dy)) / 2
  const cx = width / 2
  const cy = height / 2
  return {
    x1: cx - halfLength * dx,
    y1: cy - halfLength * dy,
    x2: cx + halfLength * dx,
    y2: cy + halfLength * dy,
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function channelToHex(c: number): string {
  return Math.max(0, Math.min(255, Math.round(c)))
    .toString(16)
    .padStart(2, '0')
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`.toUpperCase()
}

/**
 * Paleta de series para gráficos (`StackedBar`, `HorizontalBarChart`,
 * `ColumnChart`): cinco colores, en este orden. `neutral` (ver
 * `colors`) queda afuera a propósito -- está reservado para "Otras" y
 * agregados, nunca para una serie real. `navy` y `navyDeep` se
 * distinguen poco entre sí (1,28:1 de diferencia); límite recomendado
 * 4 series, la quinta (`navyDeep`) como último recurso.
 */
export const chartPalette: readonly string[] = [
  colors.navy,
  colors.magenta,
  colors.teal,
  colors.skyLight,
  colors.navyDeep,
]

/**
 * Mezcla `strength` del color con blanco (`c * strength + 255 *
 * (1 - strength)` por canal) -- la variante más clara que usa
 * `chartColor` a partir de la sexta serie, cuando el ciclo de
 * `chartPalette` se repite.
 */
export function tint(hex: string, strength = 0.6): string {
  const { r, g, b } = hexToRgb(hex)
  const mix = (c: number) => c * strength + 255 * (1 - strength)
  return rgbToHex(mix(r), mix(g), mix(b))
}

/**
 * Color de contorno para un segmento de bajo contraste (`skyLight` o
 * cualquier variante de `tint`): el mismo tono mezclado 25% con
 * `navy`, 0,5pt, para que el segmento se distinga sobre blanco sin
 * depender solo del relleno -- ningún gráfico del kit depende solo
 * del color (siempre hay un valor o una leyenda con texto en
 * `colors.text` al lado).
 */
export function chartContour(hex: string): string {
  const a = hexToRgb(hex)
  const b = hexToRgb(colors.navy)
  const mix = (c1: number, c2: number) => c1 * 0.75 + c2 * 0.25
  return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b))
}

/**
 * Color de la serie en la posición `index` (0-based): recorre
 * `chartPalette` y, a partir de la sexta serie (`index >= 5`), repite
 * el ciclo con `tint` al 60% -- y así sucesivamente cada 5 series más.
 */
export function chartColor(index: number): string {
  const n = chartPalette.length
  const base = chartPalette[index % n]
  const cycle = Math.floor(index / n)
  return cycle === 0 ? base : tint(base, 0.6)
}

/**
 * Un gráfico nunca depende solo del color: además de esto, el valor o
 * la leyenda siempre llevan el texto en `colors.text`. Esto solo dice
 * si, ADEMÁS, el segmento necesita un contorno de 0,5pt (`chartContour`)
 * porque su relleno es de bajo contraste sobre blanco (`skyLight`, o
 * cualquier color que no sea uno de los cinco de `chartPalette` tal
 * cual -- es decir, una variante de `tint`).
 */
export function chartNeedsContour(color: string): boolean {
  return color === colors.skyLight || !chartPalette.includes(color)
}

/**
 * Luminancia relativa y ratio de contraste de WCAG 2.x -- usado por el
 * test de contraste de tokens (`tests/contrast.test.mjs`) y disponible
 * acá por si una app necesita validar un color propio contra la
 * paleta del kit.
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA)
  const lB = relativeLuminance(hexB)
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}
