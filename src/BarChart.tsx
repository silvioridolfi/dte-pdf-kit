import { Svg, G, Rect, Text } from '@react-pdf/renderer'
import { chartColor, chartContour, chartNeedsContour, colors, fontFamily, weight } from './tokens.js'
import { toSafeChartNumber } from './numbers.js'
import { fitText, wrapText } from './text-metrics.js'
import {
  DEFAULT_EMPTY_TEXT,
  formatChartValue,
  isChartEmpty,
  resolveChartWidth,
  useChartCardWidth,
  type ChartOrientation,
  type ChartSize,
} from './chart-common.js'

export type BarChartEntry = {
  label: string
  value: number
  /** navy, magenta o teal -- los acentos del kit, para comparaciones de
   * un par de series (ej. taller vs. territorio). Ignorado si viene
   * `color`. */
  variant?: 'navy' | 'magenta' | 'teal'
  /** Color explícito -- gana sobre `variant`. Si ninguno de los dos
   * viene, se usa `chartColor(índice)`. */
  color?: string
}

const VARIANT_COLOR: Record<NonNullable<BarChartEntry['variant']>, string> = {
  navy: colors.navy,
  magenta: colors.magenta,
  teal: colors.teal,
}

/** Hueco entre el rótulo (truncado con `labelLines`) y el inicio de
 * la barra -- sin esto, `fitText`/`wrapText` podían dejar el rótulo
 * justo pegado a `labelWidth`, donde arranca la barra. */
export const LABEL_BAR_GAP = 4

/**
 * Barras horizontales simples dibujadas a mano con primitivas de SVG --
 * @react-pdf/renderer no trae un componente de gráficos, así que esto es
 * lo mínimo necesario para darle una referencia visual rápida a una
 * comparación de pocos valores, sin sumar una librería de charting
 * nueva solo para un informe en PDF.
 *
 * Totalmente compatible hacia atrás: sin ninguno de los props nuevos
 * (`sortBy`, `maxItems`, `labelLines`, `max`, `orientation`, `size`),
 * el resultado es idéntico al de antes -- `width` sigue siendo 460 por
 * defecto salvo que el gráfico esté adentro de un `ChartCard` o se le
 * pida `orientation`/`size` explícitamente.
 */
export function HorizontalBarChart({
  bars,
  width,
  barHeight = 13,
  gap = 9,
  labelWidth = 92,
  valueWidth = 36,
  sortBy = 'none',
  maxItems,
  otherLabel = 'Otras',
  otherColor = colors.neutral,
  labelLines,
  max,
  orientation,
  size,
  format,
  emptyText = DEFAULT_EMPTY_TEXT,
}: {
  bars: BarChartEntry[]
  width?: number
  barHeight?: number
  gap?: number
  labelWidth?: number
  valueWidth?: number
  /** Orden de las barras -- 'none' (tal cual vinieron, default),
   * 'value-desc'/'value-asc'. Orden estable: dos valores iguales
   * mantienen su orden original. */
  sortBy?: 'none' | 'value-desc' | 'value-asc'
  /** Si hay más de `maxItems` barras, agrupa el resto en una última
   * barra "Otras" (siempre al final, sea cual sea su valor sumado).
   * Valores menores a 2 se ignoran (no tiene sentido agrupar en 1). */
  maxItems?: number
  otherLabel?: string
  otherColor?: string
  /** Trunca (1) o envuelve hasta 2 líneas (2) el label de cada barra
   * según `labelWidth` -- si no se pasa, el label se dibuja tal cual
   * (comportamiento histórico, para no mover ni un píxel los informes
   * que ya lo usan). */
  labelLines?: 1 | 2
  /** Escala compartida -- si no viene, se usa el máximo de los
   * valores mostrados (como antes). */
  max?: number
  orientation?: ChartOrientation
  size?: ChartSize
  format?: (n: number) => string
  emptyText?: string
}) {
  const cardWidth = useChartCardWidth()
  const useResolvedWidth = width === undefined && (cardWidth !== null || orientation !== undefined || size !== undefined)
  const resolvedWidth = width ?? (useResolvedWidth ? resolveChartWidth({ orientation, size }, cardWidth) : 460)

  const safeBars = bars.map((b) => ({ ...b, value: toSafeChartNumber(b.value) }))
  const values = safeBars.map((b) => b.value)

  if (isChartEmpty(values)) {
    return <Text style={{ fontFamily, fontSize: 8, fill: colors.textMuted }}>{emptyText}</Text>
  }

  // Se ordena primero y se agrupa después, así "Otras" queda siempre
  // al final -- si se agrupara antes de ordenar, un sortBy por valor
  // podría intercalarla en el medio según su total.
  const sorted = sortBars(safeBars, sortBy)
  const grouped = groupOthers(sorted, maxItems, otherLabel, otherColor)

  const resolvedBars = grouped.map((b, i) => ({
    ...b,
    resolvedColor: b.color ?? VARIANT_COLOR[b.variant ?? 'navy'] ?? chartColor(i),
  }))

  const maxValue = max ?? Math.max(1, ...resolvedBars.map((b) => b.value))
  const barAreaWidth = resolvedWidth - labelWidth - valueWidth
  const height = resolvedBars.length * (barHeight + gap) - gap

  return (
    <Svg width={resolvedWidth} height={height}>
      {resolvedBars.map((b, i) => {
        const y = i * (barHeight + gap)
        const barWidth = Math.max(2, (b.value / maxValue) * barAreaWidth)
        const displayValue = formatChartValue(b.value, values, format)
        const stroke = chartNeedsContour(b.resolvedColor) ? chartContour(b.resolvedColor) : undefined
        const labelLineTexts = computeBarLabelLines(b.label, labelWidth, labelLines)

        return (
          <G key={`${b.label}-${i}`} transform={`translate(0, ${y})`}>
            {labelLineTexts.map((line, li) => (
              <Text
                key={li}
                x={0}
                y={labelLineTexts.length > 1 ? 7 + li * 9 : barHeight - 3}
                style={{ fontFamily, fontSize: 8, fill: colors.textSecondary }}
              >
                {line}
              </Text>
            ))}
            <Rect x={labelWidth} y={0} width={barAreaWidth} height={barHeight} rx={3} fill={colors.trackBg} />
            <Rect
              x={labelWidth}
              y={0}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill={b.resolvedColor}
              stroke={stroke}
              strokeWidth={stroke ? 0.5 : undefined}
            />
            <Text
              x={labelWidth + barAreaWidth + 6}
              y={barHeight - 3}
              style={{ fontFamily, fontSize: 8, fontWeight: weight.bold, fill: colors.navy }}
            >
              {displayValue}
            </Text>
          </G>
        )
      })}
    </Svg>
  )
}

function renderLabelLines(label: string, maxWidth: number, labelLines: 1 | 2): string[] {
  const style = { size: 8, weight: weight.regular }
  if (labelLines === 1) {
    return [fitText(label, maxWidth, style).text]
  }
  return wrapText(label, maxWidth, style, 2).lines
}

/** Arma las líneas del rótulo de una barra, truncando/envolviendo
 * (si `labelLines` vino) contra el ancho REAL disponible --
 * `labelWidth` menos `LABEL_BAR_GAP`, nunca `labelWidth` a secas, que
 * es exactamente donde arranca la barra. Sin `labelLines`, el rótulo
 * se dibuja tal cual (comportamiento histórico). */
export function computeBarLabelLines(label: string, labelWidth: number, labelLines: 1 | 2 | undefined): string[] {
  if (!labelLines) return [label]
  const availableWidth = Math.max(0, labelWidth - LABEL_BAR_GAP)
  return renderLabelLines(label, availableWidth, labelLines)
}

function groupOthers(
  bars: BarChartEntry[],
  maxItems: number | undefined,
  otherLabel: string,
  otherColor: string,
): BarChartEntry[] {
  if (maxItems === undefined || maxItems < 2 || bars.length <= maxItems) return bars

  const kept = bars.slice(0, maxItems - 1)
  const rest = bars.slice(maxItems - 1)
  const otherTotal = rest.reduce((acc, b) => acc + b.value, 0)
  return [...kept, { label: otherLabel, value: otherTotal, color: otherColor }]
}

function sortBars<T extends { value: number }>(bars: T[], sortBy: 'none' | 'value-desc' | 'value-asc'): T[] {
  if (sortBy === 'none') return bars
  const withIndex = bars.map((b, i) => ({ b, i }))
  withIndex.sort((a, c) => {
    const diff = sortBy === 'value-desc' ? c.b.value - a.b.value : a.b.value - c.b.value
    return diff !== 0 ? diff : a.i - c.i
  })
  return withIndex.map(({ b }) => b)
}
