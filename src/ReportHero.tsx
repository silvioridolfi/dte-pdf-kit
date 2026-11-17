import { View, Text, Svg, Rect, Image, StyleSheet } from '@react-pdf/renderer'
import { HERO_LOGO_WHITE_RATIO, FOOTER_LOGO_RATIO, colors, contentWidth, fontFamily, hero, weight } from './tokens.js'
import { BrandGradientDef } from './gradient.js'
import { FOOTER_LOGO_DATA_URL, HERO_LOGO_WHITE_DATA_URL } from './generated-assets.js'

export type ReportHeroMeta = { label: string; value: string }

const styles = StyleSheet.create({
  band: { position: 'relative', marginBottom: 10 },
  bandContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hero.paddingX,
    paddingVertical: hero.paddingY,
  },
  bandTextCol: { flex: 1, paddingRight: hero.paddingX },
  eyebrow: {
    fontFamily,
    fontWeight: weight.bold,
    fontSize: 8,
    color: colors.skyLight,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  title: {
    fontFamily,
    fontWeight: weight.extraBold,
    fontSize: hero.titleFontSize,
    color: colors.white,
    lineHeight: hero.titleLineHeightFactor,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  metaLabel: {
    fontFamily,
    fontWeight: weight.bold,
    fontSize: 7,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaValue: { fontFamily, fontWeight: weight.regular, fontSize: 9, color: colors.text },
  notice: { marginTop: 6 },
  noticeLine: { fontFamily, fontWeight: weight.regular, fontSize: 8.5, color: colors.text },
  noticeLead: { fontFamily, fontWeight: weight.bold },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.75,
    borderTopColor: colors.borderSoft,
    paddingTop: 6,
    marginTop: 10,
  },
  footerText: { fontFamily, fontWeight: weight.regular, fontSize: 7.5, color: colors.textSecondary },
})

/**
 * Header grande para informes de una página o apaisados (ej. un
 * cronograma): banda con el degradé de marca del kit, eyebrow +
 * título en blanco a la izquierda y el logo institucional en su
 * versión blanca a la derecha; debajo, una fila de datos, un aviso
 * opcional y un pie propio del bloque (texto + logo en color).
 *
 * No reemplaza a `PdfPage`: se usa puesto adentro, como primer hijo,
 * en vez de `ReportTitle` -- el header fino y el footer institucional
 * de `PdfPage` (logo centrado + numeración de página) siguen
 * existiendo igual, sin cambios, para los informes largos que ya los
 * usan. `orientation` tiene que ser el mismo valor que se le pasa a
 * `PdfPage` para que la banda ocupe el ancho útil real de la página.
 *
 * `titleLines` (1 por defecto, hasta 2) le da al título lugar real
 * para una segunda línea -- la banda crece esa altura extra
 * (`hero.twoLineExtraHeight`) y el título usa una altura explícita de
 * `titleLines` líneas, así el motor de @react-pdf/renderer trunca con
 * "..." recién después de agotarlas, nunca antes ni superponiendo el
 * logo (que no se mueve: la columna del título usa `flex: 1` y el
 * logo `flexShrink: 0`, fijo).
 */
export function ReportHero({
  eyebrow,
  title,
  titleLines = 1,
  meta,
  notice,
  footerText,
  orientation = 'portrait',
}: {
  eyebrow?: string
  title: string
  titleLines?: 1 | 2
  meta?: ReportHeroMeta[]
  notice?: string
  footerText: string
  orientation?: 'portrait' | 'landscape'
}) {
  const width = contentWidth(orientation)
  const bandHeight = hero.height + (titleLines === 2 ? hero.twoLineExtraHeight : 0)
  const titleBoxHeight = hero.titleFontSize * hero.titleLineHeightFactor * titleLines
  const logoWidth = hero.logoHeight * HERO_LOGO_WHITE_RATIO
  const footerLogoWidth = hero.footerLogoHeight * FOOTER_LOGO_RATIO

  return (
    <View style={[styles.band, { width }]}>
      <Svg width={width} height={bandHeight}>
        <BrandGradientDef id="heroBandGrad" width={width} height={bandHeight} />
        <Rect x={0} y={0} width={width} height={bandHeight} rx={hero.radius} fill="url(#heroBandGrad)" />
      </Svg>

      <View style={[styles.bandContent, { height: bandHeight }]}>
        <View style={styles.bandTextCol}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <Text style={[styles.title, { height: titleBoxHeight }]}>{title}</Text>
        </View>
        {/* Image de @react-pdf/renderer, no un <img> HTML -- no tiene alt. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          src={HERO_LOGO_WHITE_DATA_URL}
          style={{ height: hero.logoHeight, width: logoWidth, flexShrink: 0 }}
        />
      </View>

      {meta && meta.length > 0 && (
        <View style={styles.metaRow}>
          {meta.map((m) => (
            <View key={m.label} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{m.label}</Text>
              <Text style={styles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>
      )}

      {notice && (
        <View style={styles.notice}>
          {notice.split('\n').map((line, i) => (
            <Text key={i} style={styles.noticeLine}>
              {i === 0 && <Text style={styles.noticeLead}>Aviso: </Text>}
              {line || ' '}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>{footerText}</Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={FOOTER_LOGO_DATA_URL} style={{ height: hero.footerLogoHeight, width: footerLogoWidth }} />
      </View>
    </View>
  )
}
