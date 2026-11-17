import type { ReactNode } from 'react'
import { Page, View, Text, Image, Svg, Rect, StyleSheet } from '@react-pdf/renderer'
import { ensureFontsRegistered } from './fonts.js'
import { FOOTER_LOGO_RATIO, colors, contentWidth, fontFamily, header, footer, pageMargins, weight } from './tokens.js'
import { BrandGradientDef } from './gradient.js'
import { FOOTER_LOGO_DATA_URL } from './generated-assets.js'

ensureFontsRegistered()

const styles = StyleSheet.create({
  page: {
    paddingTop: pageMargins.top,
    paddingBottom: pageMargins.bottom,
    paddingHorizontal: pageMargins.side,
    fontFamily,
    fontSize: 9,
    color: colors.text,
  },
  headerFixed: {
    position: 'absolute',
    top: header.top,
    left: pageMargins.side,
    right: pageMargins.side,
    height: header.height,
  },
  footerFixed: {
    position: 'absolute',
    bottom: footer.logoBottom,
    left: pageMargins.side,
    right: pageMargins.side,
    alignItems: 'center',
  },
  pageNumber: {
    position: 'absolute',
    bottom: footer.pageNumberBottom,
    right: pageMargins.side,
    fontFamily,
    fontWeight: weight.medium,
    fontSize: 7.5,
    color: colors.textMuted,
  },
})

/** Banda del header: degradé de marca del DTE (135°, navyDeep -> navy
 * al 45% -> magenta), con "DTE" + separador + "Dirección de Tecnología
 * Educativa" a la izquierda y el nombre del programa a la derecha. Se
 * arma con <Svg> en vez de <View> porque @react-pdf/renderer no tiene
 * gradientes de CSS -- el único jeito de pintar un degradé es con un
 * <LinearGradient> de SVG detrás del texto. */
function HeaderBand({ bandWidth, title, subtitle }: { bandWidth: number; title: string; subtitle: string }) {
  const bandHeight = header.height
  const midY = bandHeight / 2 + 3
  return (
    <Svg width={bandWidth} height={bandHeight}>
      <BrandGradientDef id="dteHeaderGrad" width={bandWidth} height={bandHeight} />
      <Rect x={0} y={0} width={bandWidth} height={bandHeight} rx={header.radius} fill="url(#dteHeaderGrad)" />
      <Text
        x={16}
        y={midY}
        fill={colors.white}
        style={{ fontFamily, fontWeight: weight.extraBold, fontSize: 11, letterSpacing: 1.4 }}
      >
        DTE
      </Text>
      <Rect x={44} y={bandHeight * 0.28} width={0.75} height={bandHeight * 0.44} fill={colors.white} fillOpacity={0.55} />
      <Text x={54} y={midY} fill={colors.white} style={{ fontFamily, fontWeight: weight.medium, fontSize: 8 }}>
        {title}
      </Text>
      <Text
        x={bandWidth - 14}
        y={midY - 0.5}
        textAnchor="end"
        fill={colors.white}
        style={{ fontFamily, fontWeight: weight.semiBold, fontSize: 8 }}
      >
        {subtitle}
      </Text>
    </Svg>
  )
}

function Footer({ logoWidth }: { logoWidth: number }) {
  return (
    <>
      <View style={styles.footerFixed} fixed>
        {/* Image de @react-pdf/renderer, no un <img> HTML -- no tiene alt. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={FOOTER_LOGO_DATA_URL} style={{ height: footer.logoHeight, width: logoWidth }} />
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </>
  )
}

/**
 * Página A4 con el header y el footer institucionales del DTE, siempre
 * iguales en todos los informes. Es el único lugar donde un informe
 * nuevo necesita tocar <Page> -- todo lo demás (título, secciones,
 * tablas) se arma con el resto de los componentes de este kit puestos
 * adentro de <PdfPage>.
 *
 * `headerTitle`/`headerSubtitle` dejan el texto de la banda del header
 * configurable (cada app que use el kit tiene su propio nombre de
 * dirección/programa); por defecto son los de la DTE / Prácticas
 * Educativas en Ambientes de Trabajo.
 */
export function PdfPage({
  children,
  orientation = 'portrait',
  headerTitle = 'Dirección de Tecnología Educativa',
  headerSubtitle = 'Prácticas Educativas en Ambientes de Trabajo',
}: {
  children: ReactNode
  orientation?: 'portrait' | 'landscape'
  headerTitle?: string
  headerSubtitle?: string
}) {
  const bandWidth = contentWidth(orientation)
  const logoWidth = footer.logoHeight * FOOTER_LOGO_RATIO

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.headerFixed} fixed>
        <HeaderBand bandWidth={bandWidth} title={headerTitle} subtitle={headerSubtitle} />
      </View>

      {children}

      <Footer logoWidth={logoWidth} />
    </Page>
  )
}
