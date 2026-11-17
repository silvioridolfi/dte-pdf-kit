import { useId } from 'react'
import { View, StyleSheet, Svg, Defs, ClipPath, Rect, G } from '@react-pdf/renderer'
import { chartColor, chartContour, chartNeedsContour, colors, fontFamily, weight } from './tokens.js'
import { toSafeChartNumber } from './numbers.js'
import {
  DEFAULT_EMPTY_TEXT,
  formatChartValue,
  isChartEmpty,
  resolveChartWidth,
  useChartCardWidth,
  type ChartOrientation,
  type ChartSize,
} from './chart-common.js'
import { Text } from './Text.js'

export type StackedBarSegment = {
  key: string
  label: string
  value: number
  color?: string
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: { width: 7, height: 7, borderRadius: 1.5 },
  legendLabel: { fontFamily, fontWeight: weight.medium, fontSize: 7.5, color: colors.text },
  legendValue: { fontFamily, fontWeight: weight.regular, fontSize: 7.5, color: colors.textSecondary },
  empty: { fontFamily, fontWeight: weight.regular, fontSize: 8, color: colors.textMuted },
})

/**
 * Barra de un solo total segmentada (ej. distribución de un total por
 * categoría), con la leyenda siempre debajo -- nunca al costado, para
 * no competirle en ancho a la barra. Puntas redondeadas solo en los
 * extremos externos (vía un `ClipPath` con el `rx` del alto de la
 * barra, no en cada segmento individual).
 */
export function StackedBar({
  segments,
  legendValue = 'both',
  gap = 1,
  barHeight = 18,
  width,
  orientation = 'portrait',
  size = 'full',
  format,
  roundToTotal = false,
  emptyText = DEFAULT_EMPTY_TEXT,
}: {
  segments: StackedBarSegment[]
  legendValue?: 'value' | 'percent' | 'both' | 'none'
  gap?: number
  barHeight?: number
  width?: number
  orientation?: ChartOrientation
  size?: ChartSize
  format?: (n: number) => string
  /** Redondea los porcentajes de la leyenda al entero más cercano
   * ajustando por "resto mayor" para que sumen exactamente 100%, en
   * vez de que cada uno redondee por separado y la suma quede en
   * 99% o 101%. */
  roundToTotal?: boolean
  emptyText?: string
}) {
  const cardWidth = useChartCardWidth()
  const resolvedWidth = resolveChartWidth({ width, orientation, size }, cardWidth)
  const reactId = useId()

  const values = segments.map((s) => toSafeChartNumber(s.value))
  const total = values.reduce((acc, v) => acc + v, 0)

  if (isChartEmpty(values)) {
    return <Text style={styles.empty}>{emptyText}</Text>
  }

  const colorsByIndex = segments.map((s, i) => s.color ?? chartColor(i))
  const percents = roundToTotal ? largestRemainderRound(values, total) : values.map((v) => (total > 0 ? (v / total) * 100 : 0))

  let cursor = 0
  const bars = segments
    .map((s, i) => ({ s, value: values[i], color: colorsByIndex[i] }))
    .filter(({ value }) => value > 0)
    .map(({ s, value, color }, visibleIndex, arr) => {
      const barWidth = Math.max(0, (value / total) * resolvedWidth - (visibleIndex < arr.length - 1 ? gap : 0))
      const x = cursor
      cursor += barWidth + gap
      return { key: s.key, x, barWidth, color }
    })

  const clipId = `stacked-bar-clip-${reactId}`

  return (
    <View wrap={false}>
      <Svg width={resolvedWidth} height={barHeight}>
        <Defs>
          <ClipPath id={clipId}>
            <Rect x={0} y={0} width={resolvedWidth} height={barHeight} rx={barHeight / 2} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          <Rect x={0} y={0} width={resolvedWidth} height={barHeight} fill={colors.trackBg} />
          {bars.map(({ key, x, barWidth, color }) => {
            const stroke = chartNeedsContour(color) ? chartContour(color) : undefined
            return (
              <Rect
                key={key}
                x={x}
                y={0}
                width={barWidth}
                height={barHeight}
                fill={color}
                stroke={stroke}
                strokeWidth={stroke ? 0.5 : undefined}
              />
            )
          })}
        </G>
      </Svg>
      <View style={styles.legend}>
        {segments.map((s, i) => {
          const value = values[i]
          const pct = percents[i]
          const valueText = formatChartValue(value, values, format)
          const pctText = `${roundToTotal ? pct : Math.round(pct)}%`
          const suffix =
            legendValue === 'none'
              ? ''
              : legendValue === 'value'
                ? ` ${valueText}`
                : legendValue === 'percent'
                  ? ` ${pctText}`
                  : ` ${valueText} (${pctText})`
          return (
            <View key={s.key} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: colorsByIndex[i] }]} />
              <Text style={styles.legendLabel}>{s.label}</Text>
              {suffix !== '' && <Text style={styles.legendValue}>{suffix}</Text>}
            </View>
          )
        })}
      </View>
    </View>
  )
}

/** Redondea `values/total*100` al entero más cercano por "resto
 * mayor": trunca todos, y reparte los puntos que faltan para llegar a
 * 100 a los que tenían el resto más grande -- así la suma de los
 * porcentajes mostrados siempre da exactamente 100%. */
function largestRemainderRound(values: number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0)

  const raw = values.map((v) => (v / total) * 100)
  const floored = raw.map((p) => Math.floor(p))
  const remainder = 100 - floored.reduce((acc, p) => acc + p, 0)

  const order = raw
    .map((p, i) => ({ i, frac: p - floored[i] }))
    .sort((a, b) => b.frac - a.frac)

  const result = [...floored]
  for (let k = 0; k < remainder; k++) {
    result[order[k % order.length].i] += 1
  }
  return result
}
