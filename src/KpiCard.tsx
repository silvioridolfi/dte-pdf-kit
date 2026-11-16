import type { ReactNode } from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, kpi, weight } from './tokens.js'
import { ProgressBar, type ProgressBarVariant } from './ProgressBar.js'

export type KpiVariant = 'navy' | 'magenta' | 'teal' | 'oro' | 'plata' | 'bronce'

const VARIANT: Record<KpiVariant, { bg: string; accent: string; value: string }> = {
  navy: { bg: colors.cardBg, accent: colors.navy, value: colors.navy },
  magenta: { bg: colors.cardBg, accent: colors.magenta, value: colors.magenta },
  teal: { bg: colors.cardBg, accent: colors.teal, value: colors.navy },
  oro: { bg: colors.oroBg, accent: colors.oroAccent, value: colors.oroText },
  plata: { bg: colors.plataBg, accent: colors.plataAccent, value: colors.plataText },
  bronce: { bg: colors.bronceBg, accent: colors.bronceAccent, value: colors.bronceText },
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  card: {
    position: 'relative',
    borderRadius: kpi.radius,
    paddingVertical: 7,
    paddingLeft: kpi.accentWidth + 7,
    paddingRight: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: kpi.accentWidth },
  label: { fontFamily, fontWeight: weight.medium, fontSize: 7.5, color: colors.textSecondary, marginTop: 2 },
  progressWrap: { marginTop: 5 },
})

/** Fila de KpiCard que envuelve (flexWrap) con el espaciado estándar del
 * kit -- se le pasan los KpiCard ya con su `columns` elegido. */
export function KpiGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}

/**
 * Tarjeta de indicador: franja de acento a la izquierda, número grande
 * y label chico debajo, con una barra de progreso opcional. `columns`
 * define tanto el ancho (grilla de 3 o de 6) como el tamaño del número,
 * para no tener que coordinar las dos cosas a mano en cada informe.
 */
export function KpiCard({
  value,
  label,
  columns,
  variant = 'navy',
  progress,
  progressVariant,
}: {
  value: string | number
  label: string
  columns: 3 | 6
  variant?: KpiVariant
  progress?: number
  progressVariant?: ProgressBarVariant
}) {
  const palette = VARIANT[variant]
  const width = columns === 3 ? '31%' : '15%'
  const valueFontSize = columns === 3 ? 23 : 17

  return (
    <View style={[styles.card, { backgroundColor: palette.bg, width }]}>
      <View style={[styles.accent, { backgroundColor: palette.accent }]} />
      <Text style={{ fontFamily, fontWeight: weight.extraBold, fontSize: valueFontSize, color: palette.value }}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {progress !== undefined && (
        <View style={styles.progressWrap}>
          <ProgressBar value={progress} variant={progressVariant ?? (variant === 'oro' || variant === 'plata' || variant === 'bronce' ? 'navy' : variant)} />
        </View>
      )}
    </View>
  )
}
