import { Svg, G, Rect, Line, Text as SvgText, View, StyleSheet } from '@react-pdf/renderer'
import { chartColor, chartContour, chartNeedsContour, colors, fontFamily, weight } from './tokens.js'
import { toSafeChartNumber } from './numbers.js'
import { fitsInWidth, fitText, labelLayout, textWidth } from './text-metrics.js'
import { Text } from './Text.js'
import {
  DEFAULT_EMPTY_TEXT,
  formatChartValue,
  isChartEmpty,
  resolveChartWidth,
  useChartCardWidth,
  type ChartOrientation,
  type ChartSeriesSpec,
  type ChartSize,
} from './chart-common.js'

export type ColumnChartDatum = {
  label: string
  values: Record<string, number>
}

const AXIS_LABEL_STYLE = { size: 6.8, weight: weight.regular }
const VALUE_LABEL_STYLE = { size: 6.5, weight: weight.bold }

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: { width: 7, height: 7, borderRadius: 1.5 },
  legendLabel: { fontFamily, fontWeight: weight.medium, fontSize: 7.5, color: colors.text },
  summary: { fontFamily, fontWeight: weight.bold, fontSize: 7.5, color: colors.text, marginTop: 2 },
  empty: { fontFamily, fontWeight: weight.regular, fontSize: 8, color: colors.textMuted },
})

/**
 * Columnas apiladas (`mode="stacked"`, default) o superpuestas
 * (`mode="overlay"`) sobre un eje vertical con ticks "redondos"
 * (pasos de 1/2/5 x 10ⁿ). Los labels del eje X se acomodan solos
 * (horizontal, 45° o 45° con salteo) según lo que entra en el ancho
 * de cada columna -- ver `labelLayout` en text-metrics.ts.
 */
export function ColumnChart({
  series,
  data,
  mode = 'stacked',
  plotHeight = 118,
  ticks = 4,
  showValues = true,
  showLegend = true,
  summary,
  gap = 2,
  overlayWidthRatio = 0.56,
  overlayLabelSeries,
  yLabel,
  width,
  orientation,
  size,
  format,
  emptyText = DEFAULT_EMPTY_TEXT,
}: {
  series: ChartSeriesSpec[]
  data: ColumnChartDatum[]
  mode?: 'stacked' | 'overlay'
  plotHeight?: number
  ticks?: number
  showValues?: boolean
  showLegend?: boolean
  /** Líneas en negrita debajo de la leyenda (ej. totales, promedios). */
  summary?: string[]
  gap?: number
  overlayWidthRatio?: number
  /** Solo para `mode="overlay"` -- qué serie etiquetar arriba de la
   * barra más alta de cada columna. Por defecto, la última serie. */
  overlayLabelSeries?: string
  yLabel?: string
  width?: number
  orientation?: ChartOrientation
  size?: ChartSize
  format?: (n: number) => string
  emptyText?: string
}) {
  const cardWidth = useChartCardWidth()
  const resolvedWidth = resolveChartWidth({ width, orientation, size }, cardWidth)

  const safeData = data.map((d) => ({
    label: d.label,
    values: Object.fromEntries(series.map((s) => [s.key, toSafeChartNumber(d.values[s.key])])),
  }))
  const allValues = safeData.flatMap((d) => Object.values(d.values))

  if (data.length === 0 || series.length === 0 || isChartEmpty(allValues)) {
    return <Text style={styles.empty}>{emptyText}</Text>
  }

  const columnTotal = (d: (typeof safeData)[number]) =>
    mode === 'stacked' ? series.reduce((acc, s) => acc + d.values[s.key], 0) : Math.max(...series.map((s) => d.values[s.key]))
  const maxValue = Math.max(...safeData.map(columnTotal))

  const step = niceStep(maxValue, ticks)
  const axisMax = Math.max(step, Math.ceil(maxValue / step) * step)
  const tickValues: number[] = []
  for (let v = 0; v <= axisMax + step / 2; v += step) tickValues.push(v)

  const tickLabels = tickValues.map((v) => formatChartValue(v, tickValues, format))
  const leftMargin = Math.max(...tickLabels.map((t) => textWidth(t, AXIS_LABEL_STYLE))) + 8

  const plotWidth = resolvedWidth - leftMargin
  const columnSlotWidth = plotWidth / safeData.length
  const labels = safeData.map((d) => d.label)
  const xLayout = labelLayout(labels, columnSlotWidth, AXIS_LABEL_STYLE)

  const axisHeight = 10
  // Espacio reservado arriba del todo para que el label de valor de
  // una barra que llega justo a axisMax no quede recortado fuera del
  // Svg (y = topY - 3 daría negativo si no se reserva este margen).
  const topHeadroom = showValues ? 10 : 0
  const totalHeight = topHeadroom + plotHeight + axisHeight + xLayout.reservedHeight + (yLabel ? 10 : 0)

  const colorFor = (s: ChartSeriesSpec, i: number) => s.color ?? chartColor(i)
  const labelSeriesKey = overlayLabelSeries ?? series[series.length - 1].key

  return (
    <View wrap={false}>
      <Svg width={resolvedWidth} height={totalHeight}>
        <G transform={`translate(0, ${topHeadroom + (yLabel ? 10 : 0)})`}>
          {yLabel && (
            <SvgText x={0} y={-2} style={{ fontFamily, fontSize: 6.8, fill: colors.textSecondary }}>
              {yLabel}
            </SvgText>
          )}
          {/* Eje Y: líneas horizontales + labels de los ticks */}
          {tickValues.map((v, i) => {
            const y = plotHeight - (v / axisMax) * plotHeight
            return (
              <G key={i}>
                <Line x1={leftMargin} y1={y} x2={resolvedWidth} y2={y} stroke={colors.border} strokeWidth={0.5} />
                <SvgText
                  x={leftMargin - 4}
                  y={y + 2.5}
                  textAnchor="end"
                  style={{ fontFamily, fontSize: AXIS_LABEL_STYLE.size, fill: colors.textSecondary }}
                >
                  {tickLabels[i]}
                </SvgText>
              </G>
            )
          })}

          {/* Columnas */}
          {safeData.map((d, colIndex) => {
            const slotX = leftMargin + colIndex * columnSlotWidth
            const barWidth = columnSlotWidth * 0.6
            const barX = slotX + (columnSlotWidth - barWidth) / 2

            const bars =
              mode === 'stacked'
                ? renderStackedColumn(d, series, colorFor, barX, barWidth, plotHeight, axisMax, gap)
                : renderOverlayColumn(d, series, colorFor, barX, barWidth, plotHeight, axisMax, overlayWidthRatio)

            const showLabel = xLayout.step === 1 || colIndex === 0 || colIndex === safeData.length - 1 || colIndex % xLayout.step === 0

            const tallestValue =
              mode === 'stacked' ? columnTotal(d) : Math.max(...series.map((s) => d.values[s.key]))
            const valueText = formatChartValue(
              mode === 'overlay' ? d.values[labelSeriesKey] : tallestValue,
              allValues,
              format,
            )
            const topY = plotHeight - (tallestValue / axisMax) * plotHeight

            return (
              <G key={d.label}>
                {bars}
                {showValues && fitsInWidth(valueText, columnSlotWidth, VALUE_LABEL_STYLE) && (
                  <SvgText
                    x={slotX + columnSlotWidth / 2}
                    y={topY - 3}
                    textAnchor="middle"
                    style={{ fontFamily, fontSize: VALUE_LABEL_STYLE.size, fontWeight: VALUE_LABEL_STYLE.weight, fill: colors.text }}
                  >
                    {valueText}
                  </SvgText>
                )}
                {showLabel && (
                  <G
                    transform={
                      xLayout.rotation === 45
                        ? `translate(${slotX + columnSlotWidth / 2}, ${plotHeight + 10}) rotate(45)`
                        : `translate(${slotX + columnSlotWidth / 2}, ${plotHeight + 10})`
                    }
                  >
                    <SvgText
                      x={0}
                      y={0}
                      textAnchor={xLayout.rotation === 45 ? 'start' : 'middle'}
                      style={{ fontFamily, fontSize: AXIS_LABEL_STYLE.size, fill: colors.textSecondary }}
                    >
                      {xLayout.rotation === 45
                        ? // Inclinado 45°, el texto se extiende en diagonal hacia
                          // la derecha del centro de la columna -- se trunca para
                          // que esa diagonal no se pase del borde derecho del
                          // gráfico (sobre todo notorio en la última columna).
                          fitText(
                            d.label,
                            Math.max(10, (resolvedWidth - (slotX + columnSlotWidth / 2) - 2) / Math.SQRT1_2),
                            AXIS_LABEL_STYLE,
                          ).text
                        : d.label}
                    </SvgText>
                  </G>
                )}
              </G>
            )
          })}
        </G>
      </Svg>

      {showLegend && (
        <View style={styles.legend}>
          {series.map((s, i) => (
            <View key={s.key} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: colorFor(s, i) }]} />
              <Text style={styles.legendLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}
      {summary?.map((line, i) => (
        <Text key={i} style={styles.summary}>
          {line}
        </Text>
      ))}
    </View>
  )
}

function renderStackedColumn(
  d: ColumnChartDatum,
  series: ChartSeriesSpec[],
  colorFor: (s: ChartSeriesSpec, i: number) => string,
  barX: number,
  barWidth: number,
  plotHeight: number,
  axisMax: number,
  gap: number,
) {
  let cumulative = 0
  return series.map((s, i) => {
    const value = d.values[s.key]
    const segmentHeight = (value / axisMax) * plotHeight
    const y = plotHeight - cumulative - segmentHeight
    cumulative += segmentHeight
    const color = colorFor(s, i)
    const stroke = chartNeedsContour(color) ? chartContour(color) : undefined
    const visibleGap = segmentHeight >= 10 ? gap : 0
    if (segmentHeight <= 0) return null
    return (
      <Rect
        key={s.key}
        x={barX}
        y={y + visibleGap / 2}
        width={barWidth}
        height={Math.max(0, segmentHeight - visibleGap)}
        fill={color}
        stroke={stroke}
        strokeWidth={stroke ? 0.5 : undefined}
      />
    )
  })
}

function renderOverlayColumn(
  d: ColumnChartDatum,
  series: ChartSeriesSpec[],
  colorFor: (s: ChartSeriesSpec, i: number) => string,
  barX: number,
  barWidth: number,
  plotHeight: number,
  axisMax: number,
  overlayWidthRatio: number,
) {
  // Se dibuja de atrás (serie 0, ancho completo) hacia adelante,
  // cada una más angosta y centrada sobre la anterior.
  return series.map((s, i) => {
    const value = d.values[s.key]
    const barHeight = (value / axisMax) * plotHeight
    const y = plotHeight - barHeight
    const w = barWidth * Math.pow(overlayWidthRatio, i)
    const x = barX + (barWidth - w) / 2
    const color = colorFor(s, i)
    const stroke = chartNeedsContour(color) ? chartContour(color) : undefined
    if (barHeight <= 0) return null
    return (
      <Rect key={s.key} x={x} y={y} width={w} height={barHeight} fill={color} stroke={stroke} strokeWidth={stroke ? 0.5 : undefined} />
    )
  })
}

/** Paso "redondo" (1, 2 o 5 x 10ⁿ) para los ticks del eje Y, tipo
 * d3.ticks -- nunca un paso arbitrario como 37 o 123. */
function niceStep(maxValue: number, ticks: number): number {
  if (maxValue <= 0) return 1
  const rough = maxValue / Math.max(1, ticks)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const residual = rough / magnitude
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  return niceResidual * magnitude
}
