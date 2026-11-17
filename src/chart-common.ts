/**
 * Utilidades compartidas por todos los componentes de gráficos del
 * kit (StackedBar, HorizontalBarChart, ColumnChart, ChartCard) --
 * "Reglas comunes" del pedido v0.5.0 (rev. 2): forma de las series,
 * formato de números, ancho resuelto, texto de "sin datos".
 */
import { createContext, useContext } from 'react'
import { A4_MM, mm, pageMargins } from './tokens.js'

export type ChartOrientation = 'portrait' | 'landscape'
export type ChartSize = 'full' | 'half'

export type ChartSeriesSpec = {
  key: string
  label: string
  color?: string
}

export const DEFAULT_EMPTY_TEXT = 'Sin datos'

/** Ancho útil de la página (sin márgenes laterales) para la
 * orientación dada -- A4, igual que `pageMargins`/`A4_MM`. */
export function usefulPageWidth(orientation: ChartOrientation): number {
  const widthMm = orientation === 'landscape' ? A4_MM.height : A4_MM.width
  return mm(widthMm) - 2 * pageMargins.side
}

/** Ancho de un gráfico "half" dentro de un `ChartGrid`: dos por fila,
 * con el mismo gap que usa `ChartGrid` entre tarjetas. */
export function halfChartWidth(orientation: ChartOrientation): number {
  return (usefulPageWidth(orientation) - 8) / 2
}

export const ChartCardWidthContext = createContext<number | null>(null)

/** Ancho interior disponible adentro de un `ChartCard` -- `null` si
 * no hay ninguno por encima (el gráfico está directo en la página). */
export function useChartCardWidth(): number | null {
  return useContext(ChartCardWidthContext)
}

/**
 * Resuelve el ancho de un gráfico con la prioridad del pedido:
 * 1. `width` explícito, si vino.
 * 2. El ancho interior de un `ChartCard` que lo contenga (vía
 *    contexto), si hay uno -- `size`/`orientation` propios del
 *    gráfico se ignoran, gana el de la tarjeta.
 * 3. El ancho útil de la página según `orientation`/`size`.
 */
export function resolveChartWidth(
  props: { width?: number; orientation?: ChartOrientation; size?: ChartSize },
  cardWidth: number | null,
): number {
  if (props.width !== undefined) return props.width
  if (cardWidth !== null) return cardWidth

  const orientation = props.orientation ?? 'portrait'
  const size = props.size ?? 'full'
  return size === 'half' ? halfChartWidth(orientation) : usefulPageWidth(orientation)
}

/** Formatea un número para mostrar en un gráfico: `format` explícito
 * si vino, si no `toLocaleString('es-AR')` -- entero si todos los
 * valores de la serie son enteros, con los decimales que haga falta
 * si no. */
export function formatChartValue(value: number, allValues: number[], format?: (n: number) => string): string {
  if (format) return format(value)
  const allIntegers = allValues.every((v) => Number.isInteger(v))
  return value.toLocaleString('es-AR', allIntegers ? { maximumFractionDigits: 0 } : undefined)
}

/** Si una serie de valores cuenta como "sin datos" para mostrar solo
 * `emptyText` -- vacía, o todos en 0 (un 0 real entre otros valores
 * positivos sí se dibuja normalmente). */
export function isChartEmpty(values: number[]): boolean {
  return values.length === 0 || values.every((v) => v === 0)
}
