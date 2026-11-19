/**
 * Utilidades compartidas por todos los componentes de gráficos del
 * kit (StackedBar, HorizontalBarChart, ColumnChart, ChartCard) --
 * "Reglas comunes" del pedido v0.5.0 (rev. 2): forma de las series,
 * formato de números, ancho resuelto, texto de "sin datos".
 */
// Import de todo el namespace (no `import { createContext, useContext }
// from 'react'`) a propósito: bajo la condición de resolución
// "react-server" (Route Handlers de Next.js, Server Components), el
// build de React para ese entorno no tiene `createContext`/
// `useContext` -- un import con nombre de algo que no existe ahí
// puede fallar en el momento de resolver el módulo, según el bundler
// (Turbopack/webpack son laxos y lo dejan en `undefined`; el loader
// nativo de Node en modo estricto corta antes). El import de
// namespace nunca falla por una propiedad que falte; acceder a
// `React.createContext` recién pasa cuando de verdad hace falta (ver
// `getChartCardWidthContext`), nunca al cargar el módulo.
import * as React from 'react'
import type { Context } from 'react'
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

// El contexto se crea la primera vez que hace falta (acá o en
// `ChartCard`), nunca al cargar el módulo -- `createContext`/
// `useContext` no existen bajo la condición de resolución
// "react-server" que usan los Route Handlers de Next.js (ni
// cualquier entorno de solo Server Components), y llamarlos ahí
// rompe con "createContext is not a function" apenas se importa
// CUALQUIER COSA del kit, aunque el reporte no use ningún gráfico.
// Mientras nadie renderice `ChartCard`/llame `useChartCardWidth` de
// verdad, esta función nunca se ejecuta y el import es inofensivo.
let chartCardWidthContext: Context<number | null> | undefined

export function getChartCardWidthContext(): Context<number | null> {
  chartCardWidthContext ??= React.createContext<number | null>(null)
  return chartCardWidthContext
}

/** Ancho interior disponible adentro de un `ChartCard` -- `null` si
 * no hay ninguno por encima (el gráfico está directo en la página). */
export function useChartCardWidth(): number | null {
  return React.useContext(getChartCardWidthContext())
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
