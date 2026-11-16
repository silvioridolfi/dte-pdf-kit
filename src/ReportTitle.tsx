import { View, Text, Svg, Rect, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, mm, titleDividerWidth, weight } from './tokens.js'
import { BrandGradientDef } from './gradient.js'

export type ReportTitleMeta = { label: string; value: string }

const styles = StyleSheet.create({
  eyebrowRow: { flexDirection: 'row', marginBottom: 6 },
  eyebrow: {
    backgroundColor: colors.magenta,
    borderRadius: mm(3),
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  eyebrowText: {
    fontFamily,
    fontWeight: weight.extraBold,
    fontSize: 7,
    color: colors.white,
    letterSpacing: 1,
  },
  title: { fontFamily, fontWeight: weight.extraBold, fontSize: 21, color: colors.navy, marginBottom: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: colors.cardBg,
    borderWidth: 0.75,
    borderColor: colors.border,
    borderRadius: mm(2.5),
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  metaLabel: { fontFamily, fontWeight: weight.bold, fontSize: 7, color: colors.navy },
  metaValue: { fontFamily, fontWeight: weight.regular, fontSize: 7, color: colors.textSecondary },
  note: { fontFamily, fontWeight: weight.regular, fontSize: 7.5, color: colors.textMuted, marginBottom: 6 },
  dividerWrap: { height: 1, marginBottom: 14, position: 'relative' },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.borderSoft,
  },
  dividerAccent: { position: 'absolute', left: 0, top: -0.3 },
})

/**
 * Bloque de título de un informe: etiqueta ("GRUPO N", etc.) opcional,
 * H1, chips de metadata (período, generado, integrantes...) y una línea
 * divisoria con un tramo del degradé de marca del DTE. Igual en todos
 * los informes que usen el kit -- cambia el contenido, no el armado.
 */
export function ReportTitle({
  eyebrow,
  title,
  meta,
  note,
}: {
  eyebrow?: string
  title: string
  meta: ReportTitleMeta[]
  note?: string
}) {
  return (
    <View>
      {eyebrow && (
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowText}>{eyebrow}</Text>
          </View>
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      <View style={styles.metaRow}>
        {meta.map((m) => (
          <View key={m.label} style={styles.metaChip}>
            <Text style={styles.metaLabel}>{m.label}</Text>
            <Text style={styles.metaValue}>{m.value}</Text>
          </View>
        ))}
      </View>

      {note && <Text style={styles.note}>{note}</Text>}

      <View style={styles.dividerWrap}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerAccent}>
          <Svg width={titleDividerWidth} height={1.6}>
            <BrandGradientDef id="titleDividerGrad" width={titleDividerWidth} height={1.6} />
            <Rect x={0} y={0} width={titleDividerWidth} height={1.6} fill="url(#titleDividerGrad)" />
          </Svg>
        </View>
      </View>
    </View>
  )
}
