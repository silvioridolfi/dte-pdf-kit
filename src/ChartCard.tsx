import type { ReactNode } from 'react'
import { View, StyleSheet } from '@react-pdf/renderer'
import { chartCard, colors, type } from './tokens.js'
import { Text } from './Text.js'
import { wrapText } from './text-metrics.js'
import { ChartCardWidthContext, halfChartWidth, usefulPageWidth, type ChartOrientation, type ChartSize } from './chart-common.js'

const styles = StyleSheet.create({
  card: {
    borderWidth: chartCard.borderWidth,
    borderColor: colors.border,
    borderRadius: chartCard.radius,
    padding: chartCard.padding,
    backgroundColor: colors.white,
  },
  title: { marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: chartCard.gap, marginBottom: 4 },
})

/**
 * Tarjeta contenedora de un gráfico: borde fino, mismo radio/padding
 * que `KpiCard`, título opcional en `type.cardTitle` (envuelve hasta
 * 2 líneas y trunca). Nunca se parte entre hojas (`wrap={false}`) --
 * un gráfico es una unidad visual, no tiene sentido que su mitad
 * quede en una hoja y la otra en la siguiente.
 *
 * Expone su ancho interior (ancho de la tarjeta menos el padding) vía
 * contexto (`useChartCardWidth`), así el gráfico que ponga adentro
 * (sin `width` propio) se ajusta solo, sin que el informe tenga que
 * calcularlo a mano.
 */
export function ChartCard({
  title,
  children,
  size = 'full',
  orientation = 'portrait',
}: {
  title?: string
  children: ReactNode
  size?: ChartSize
  orientation?: ChartOrientation
}) {
  const outerWidth = size === 'half' ? halfChartWidth(orientation) : usefulPageWidth(orientation)
  const innerWidth = outerWidth - 2 * chartCard.padding

  const titleLines = title
    ? wrapText(title, innerWidth, { size: type.cardTitle.fontSize, weight: type.cardTitle.fontWeight }, 2).lines
    : []

  return (
    <View style={[styles.card, { width: outerWidth }]} wrap={false}>
      {titleLines.length > 0 && <Text style={[type.cardTitle, styles.title]}>{titleLines.join('\n')}</Text>}
      <ChartCardWidthContext.Provider value={innerWidth}>{children}</ChartCardWidthContext.Provider>
    </View>
  )
}

/** Fila de `ChartCard` que envuelve (flexWrap): dos `size="half"` por
 * fila, o uno `size="full"` ocupando toda la fila -- alineados arriba
 * (no se estiran a la altura del más alto, cada gráfico tiene su
 * propia altura natural). */
export function ChartGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}
