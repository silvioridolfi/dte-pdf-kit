import type { ReactNode } from 'react'
import { View, Text as PdfText, StyleSheet } from '@react-pdf/renderer'
import { A4_MM, colors, fontFamily, kpi, mm, pageMargins, type, weight } from './tokens.js'
import { ProgressBar, type ProgressBarVariant } from './ProgressBar.js'
import { Text } from './Text.js'
import { wrapText } from './text-metrics.js'
import { toSafeNumber } from './numbers.js'

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
  // alignItems: 'stretch' es el default de Yoga para flexDirection:
  // 'row', pero se deja explícito -- es lo que hace que todas las
  // tarjetas de una misma fila (envuelta por flexWrap) tomen el alto
  // de la más alta, sin tener que calcularlo a mano.
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 8, marginBottom: 4 },
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
  detail: { marginTop: 2 },
  progressWrap: { marginTop: 5 },
})

/** Fila de KpiCard que envuelve (flexWrap) con el espaciado estándar del
 * kit -- se le pasan los KpiCard ya con su `columns` elegido. */
export function KpiGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}

/** Ancho útil de la página (sin márgenes laterales), para estimar el
 * ancho interior de un KpiCard a partir de su `columns` -- KpiGrid no
 * tiene por qué conocer en qué página vive, así que esto es una
 * aproximación conservadora (asume que KpiGrid ocupa todo el ancho de
 * contenido), nunca puede hacer que `detail` se desborde, como mucho
 * lo trunca una letra antes de lo estrictamente necesario. */
function usefulPageWidth(orientation: 'portrait' | 'landscape'): number {
  const widthMm = orientation === 'landscape' ? A4_MM.height : A4_MM.width
  return mm(widthMm) - 2 * pageMargins.side
}

function kpiInnerWidth(columns: 3 | 6, orientation: 'portrait' | 'landscape'): number {
  const outerWidth = usefulPageWidth(orientation) * (columns === 3 ? 0.31 : 0.15)
  return outerWidth - (kpi.accentWidth + 7) - 8
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
  detail,
  orientation = 'portrait',
}: {
  value: string | number
  label: string
  columns: 3 | 6
  variant?: KpiVariant
  progress?: number
  progressVariant?: ProgressBarVariant
  /** Línea chica de apoyo debajo del label (ej. "+3 vs. la etapa
   * anterior") -- envuelve hasta 2 líneas y después trunca con "…". */
  detail?: string
  /** Para estimar cuánto entra en `detail` sin desbordar -- KpiCard
   * no sabe en qué orientación de página vive, así que hay que
   * decírselo si el informe es apaisado. */
  orientation?: 'portrait' | 'landscape'
}) {
  const palette = VARIANT[variant]
  const width = columns === 3 ? '31%' : '15%'
  const valueFontSize = columns === 3 ? 23 : 17
  const safeValue = typeof value === 'number' ? toSafeNumber(value) : value
  const safeProgress = progress === undefined ? undefined : toSafeNumber(progress)

  const detailLines = detail
    ? wrapText(detail, kpiInnerWidth(columns, orientation), { size: type.label.fontSize, weight: weight.medium }, 2)
        .lines
    : []

  return (
    <View style={[styles.card, { backgroundColor: palette.bg, width }]}>
      <View style={[styles.accent, { backgroundColor: palette.accent }]} />
      <PdfText style={{ fontFamily, fontWeight: weight.extraBold, fontSize: valueFontSize, color: palette.value }}>
        {safeValue}
      </PdfText>
      <PdfText style={styles.label}>{label}</PdfText>
      {detailLines.length > 0 && (
        <Text style={[type.label, styles.detail, { color: colors.textMuted }]}>{detailLines.join('\n')}</Text>
      )}
      {safeProgress !== undefined && (
        <View style={styles.progressWrap}>
          <ProgressBar value={safeProgress} variant={progressVariant ?? (variant === 'oro' || variant === 'plata' || variant === 'bronce' ? 'navy' : variant)} />
        </View>
      )}
    </View>
  )
}
