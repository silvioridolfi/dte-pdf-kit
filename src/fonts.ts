import { Font } from '@react-pdf/renderer'
import { fontFamily, weight } from './tokens.js'
import {
  ENCODE_SANS_LIGHT_DATA_URL,
  ENCODE_SANS_REGULAR_DATA_URL,
  ENCODE_SANS_MEDIUM_DATA_URL,
  ENCODE_SANS_SEMI_BOLD_DATA_URL,
  ENCODE_SANS_BOLD_DATA_URL,
  ENCODE_SANS_EXTRA_BOLD_DATA_URL,
} from './generated-assets.js'

let registered = false

/**
 * Registra Encode Sans (300 a 800) una sola vez por proceso. Los 6
 * pesos viajan embebidos como data: URLs (ver generated-assets.ts,
 * generado por scripts/build-assets.mjs a partir de assets/fonts/) --
 * son instancias estáticas generadas a partir de la fuente variable
 * oficial de Google Fonts (ofl/encodesans, ejes wght+wdth, instanciada
 * en wdth=100 -- ancho normal, no condensada) con
 * `fonttools varLib.instancer`, porque @react-pdf/renderer no soporta
 * WOFF2 y no instancia fuentes variables al vuelo.
 *
 * También desactiva la hyphenation por defecto: sin esto, una palabra
 * larga que no entra en una columna angosta se parte en cualquier
 * sílaba con un guion. Devolver la palabra entera como único fragmento
 * le dice al layout que no hay dónde cortarla -- sigue pudiendo pasar
 * de línea en los espacios, solo no la parte a la mitad.
 */
export function ensureFontsRegistered() {
  if (registered) return
  registered = true

  Font.register({
    family: fontFamily,
    fonts: [
      { src: ENCODE_SANS_LIGHT_DATA_URL, fontWeight: weight.light },
      { src: ENCODE_SANS_REGULAR_DATA_URL, fontWeight: weight.regular },
      { src: ENCODE_SANS_MEDIUM_DATA_URL, fontWeight: weight.medium },
      { src: ENCODE_SANS_SEMI_BOLD_DATA_URL, fontWeight: weight.semiBold },
      { src: ENCODE_SANS_BOLD_DATA_URL, fontWeight: weight.bold },
      { src: ENCODE_SANS_EXTRA_BOLD_DATA_URL, fontWeight: weight.extraBold },
    ],
  })

  Font.registerHyphenationCallback((word) => [word])
}
