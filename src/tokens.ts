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
  textMuted: '#8A9AA8',
  white: '#FFFFFF',

  distritoBg: '#E4F4F8',
  distritoText: '#3E7E96',

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
