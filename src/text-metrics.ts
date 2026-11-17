/**
 * Medición real de texto en Encode Sans, para los componentes de
 * gráficos (truncar labels, armar leyendas que envuelven, decidir si
 * rotar los labels del eje X, etc.) -- nunca por longitud de
 * caracteres (`text.length * constante`), que no sirve con una
 * tipografía proporcional ni con los distintos pesos del kit.
 *
 * Usa `fontkit` (la misma librería que usa @react-pdf/renderer
 * internamente para el shaping) abriendo los mismos TTF estáticos que
 * `ensureFontsRegistered` ya registra, así el ancho medido coincide
 * con el que @react-pdf/renderer efectivamente dibuja (incluyendo
 * kerning) -- verificado con <0,01% de error contra texto ya
 * posicionado (pdftotext -bbox, ver tests/text-metrics.test.mjs).
 *
 * La decisión de wrap de Yoga dentro de un contenedor de ancho fijo
 * tiene su propio margen interno de hasta ~3% del ancho del texto
 * (medido empíricamente, no documentado por @react-pdf/renderer), por
 * lo que `textWidth()` puede sobrestimar levemente cuánto entra en un
 * contenedor angosto. Siempre en el sentido seguro: trunca/envuelve
 * un poco antes de lo estrictamente necesario, nunca después (nunca
 * se desborda).
 */
import * as fontkit from 'fontkit'
import {
  ENCODE_SANS_LIGHT_DATA_URL,
  ENCODE_SANS_REGULAR_DATA_URL,
  ENCODE_SANS_MEDIUM_DATA_URL,
  ENCODE_SANS_SEMI_BOLD_DATA_URL,
  ENCODE_SANS_BOLD_DATA_URL,
  ENCODE_SANS_EXTRA_BOLD_DATA_URL,
} from './generated-assets.js'

export type TextStyleSpec = { size: number; weight: number }

const DATA_URL_BY_WEIGHT: Record<number, string> = {
  300: ENCODE_SANS_LIGHT_DATA_URL,
  400: ENCODE_SANS_REGULAR_DATA_URL,
  500: ENCODE_SANS_MEDIUM_DATA_URL,
  600: ENCODE_SANS_SEMI_BOLD_DATA_URL,
  700: ENCODE_SANS_BOLD_DATA_URL,
  800: ENCODE_SANS_EXTRA_BOLD_DATA_URL,
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Buffer.from(base64, 'base64')
}

function closestRegisteredWeight(weight: number): number {
  const weights = Object.keys(DATA_URL_BY_WEIGHT).map(Number)
  return weights.reduce((closest, w) => (Math.abs(w - weight) < Math.abs(closest - weight) ? w : closest))
}

const fontCache = new Map<number, fontkit.Font>()

function getFont(weight: number): fontkit.Font {
  const resolvedWeight = closestRegisteredWeight(weight)
  const cached = fontCache.get(resolvedWeight)
  if (cached) return cached

  const dataUrl = DATA_URL_BY_WEIGHT[resolvedWeight]
  const opened = fontkit.create(dataUrlToBuffer(dataUrl))
  // Los TTF del kit son instancias estáticas (no colecciones), nunca
  // devuelven un FontCollection.
  const font = opened as fontkit.Font
  fontCache.set(resolvedWeight, font)
  return font
}

const widthCache = new Map<string, number>()

/** Ancho real, en puntos, de `text` con el tamaño y peso dados -- con
 * kerning, igual que lo que @react-pdf/renderer termina dibujando. */
export function textWidth(text: string, style: TextStyleSpec): number {
  if (text === '') return 0

  const key = `${style.weight}:${style.size}:${text}`
  const cached = widthCache.get(key)
  if (cached !== undefined) return cached

  const font = getFont(style.weight)
  const run = font.layout(text)
  const scale = style.size / font.unitsPerEm
  const width = run.positions.reduce((sum, p) => sum + p.xAdvance, 0) * scale

  widthCache.set(key, width)
  return width
}

/** Si `text` entra, sin cortar, en `maxWidth` puntos. */
export function fitsInWidth(text: string, maxWidth: number, style: TextStyleSpec): boolean {
  return textWidth(text, style) <= maxWidth
}

const ELLIPSIS = '…'

/** Trunca `text` en el último carácter que entra en `maxWidth`,
 * agregando "…" -- nunca devuelve un texto cuyo ancho medido supere
 * `maxWidth` (salvo que ni "…" solo entre, en cuyo caso devuelve ''). */
export function fitText(text: string, maxWidth: number, style: TextStyleSpec): { text: string; truncated: boolean } {
  if (fitsInWidth(text, maxWidth, style)) {
    return { text, truncated: false }
  }
  if (!fitsInWidth(ELLIPSIS, maxWidth, style)) {
    return { text: '', truncated: true }
  }

  let lo = 0
  let hi = text.length
  let best = ELLIPSIS

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const candidate = `${text.slice(0, mid).trimEnd()}${ELLIPSIS}`
    if (fitsInWidth(candidate, maxWidth, style)) {
      best = candidate
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return { text: best, truncated: true }
}

/** Envuelve `text` en hasta `maxLines` líneas de `maxWidth` puntos
 * (word-wrap, nunca corta una palabra a la mitad), truncando la
 * última línea con "…" si no entran todas las palabras. */
export function wrapText(
  text: string,
  maxWidth: number,
  style: TextStyleSpec,
  maxLines: number,
): { lines: string[]; truncated: boolean } {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { lines: [], truncated: false }

  const lines: string[] = []
  let current = ''
  let i = 0

  while (i < words.length && lines.length < maxLines) {
    const word = words[i]
    const candidate = current ? `${current} ${word}` : word
    if (current === '' || fitsInWidth(candidate, maxWidth, style)) {
      current = candidate
      i++
    } else {
      lines.push(current)
      current = ''
    }
  }

  const wordsLeftOver = i < words.length
  if (lines.length < maxLines) {
    lines.push(current)
    current = ''
  }

  const truncated = wordsLeftOver || current !== ''
  if (truncated && lines.length > 0) {
    const lastIndex = lines.length - 1
    const extra = current ? ` ${current}` : ''
    const { text: fitted } = fitText(`${lines[lastIndex]}${extra}`, maxWidth, style)
    lines[lastIndex] = fitted
  }

  return { lines, truncated }
}

/** Decide cómo ubicar los labels de un eje X dentro de `slotWidth`
 * puntos por columna: horizontal si entran, inclinados 45° si así
 * entran, o inclinados 45° con un `step` de salteo (siempre
 * conservando el primero y el último) si ni así entran. */
export function labelLayout(
  labels: string[],
  slotWidth: number,
  style: TextStyleSpec,
  opts?: { minGap?: number },
): { rotation: 0 | 45; step: number; reservedHeight: number; reservedLeft: number } {
  const minGap = opts?.minGap ?? 4
  const lineHeight = style.size * 1.2

  if (labels.length === 0) {
    return { rotation: 0, step: 1, reservedHeight: lineHeight, reservedLeft: 0 }
  }

  const maxWidth = Math.max(...labels.map((label) => textWidth(label, style)))

  if (maxWidth + minGap <= slotWidth) {
    return { rotation: 0, step: 1, reservedHeight: lineHeight, reservedLeft: 0 }
  }

  const diagonal = maxWidth * Math.SQRT1_2
  const reservedHeight = diagonal + style.size * Math.SQRT1_2 + minGap
  const reservedLeft = Math.max(0, diagonal / 2 - slotWidth / 2)

  if (diagonal + minGap <= slotWidth) {
    return { rotation: 45, step: 1, reservedHeight, reservedLeft }
  }

  let step = 1
  while (slotWidth * step < diagonal + minGap) step++

  return { rotation: 45, step, reservedHeight, reservedLeft }
}
