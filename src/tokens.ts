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
  navy: '#06466E',
  violet: '#6E4A92',
  magenta: '#CD2B7B',
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

export const kpi = {
  radius: mm(2.5),
  accentWidth: mm(1.2),
}

export const titleDividerWidth = mm(28)
