import { Svg, G, Rect, Text } from '@react-pdf/renderer'
import { colors, fontFamily, weight } from './tokens.js'

export type BarChartEntry = {
  label: string
  value: number
  /** navy, magenta o teal -- los acentos del kit, para comparaciones de
   * un par de series (ej. taller vs. territorio). */
  variant?: 'navy' | 'magenta' | 'teal'
}

const VARIANT_COLOR: Record<NonNullable<BarChartEntry['variant']>, string> = {
  navy: colors.navy,
  magenta: colors.magenta,
  teal: colors.teal,
}

/**
 * Barras horizontales simples dibujadas a mano con primitivas de SVG --
 * @react-pdf/renderer no trae un componente de gráficos, así que esto es
 * lo mínimo necesario para darle una referencia visual rápida a una
 * comparación de pocos valores, sin sumar una librería de charting
 * nueva solo para un informe en PDF.
 */
export function HorizontalBarChart({
  bars,
  width = 460,
  barHeight = 13,
  gap = 9,
  labelWidth = 92,
  valueWidth = 36,
}: {
  bars: BarChartEntry[]
  width?: number
  barHeight?: number
  gap?: number
  labelWidth?: number
  valueWidth?: number
}) {
  const maxValue = Math.max(1, ...bars.map((b) => b.value))
  const barAreaWidth = width - labelWidth - valueWidth
  const height = bars.length * (barHeight + gap) - gap

  return (
    <Svg width={width} height={height}>
      {bars.map((b, i) => {
        const y = i * (barHeight + gap)
        const barWidth = Math.max(2, (b.value / maxValue) * barAreaWidth)
        const color = VARIANT_COLOR[b.variant ?? 'navy']
        return (
          <G key={b.label} transform={`translate(0, ${y})`}>
            <Text x={0} y={barHeight - 3} style={{ fontFamily, fontSize: 8, fill: colors.textSecondary }}>
              {b.label}
            </Text>
            <Rect x={labelWidth} y={0} width={barAreaWidth} height={barHeight} rx={3} fill={colors.trackBg} />
            <Rect x={labelWidth} y={0} width={barWidth} height={barHeight} rx={3} fill={color} />
            <Text
              x={labelWidth + barAreaWidth + 6}
              y={barHeight - 3}
              style={{ fontFamily, fontSize: 8, fontWeight: weight.bold, fill: colors.navy }}
            >
              {b.value}
            </Text>
          </G>
        )
      })}
    </Svg>
  )
}
