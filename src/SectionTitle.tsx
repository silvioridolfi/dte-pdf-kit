import type { ReactNode } from 'react'
import { View, Text, Svg, Defs, LinearGradient, Stop, Rect, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, weight } from './tokens.js'

const BAR_WIDTH = 2.4
const BAR_HEIGHT = 12

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, marginBottom: 7 },
  heading: { fontFamily, fontWeight: weight.bold, fontSize: 11.5, color: colors.navy },
})

/** H2 de sección, con la barrita vertical de degradé navy -> magenta a
 * la izquierda que distingue a los informes armados con este kit. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row} wrap={false}>
      <Svg width={BAR_WIDTH} height={BAR_HEIGHT}>
        <Defs>
          <LinearGradient id="sectionBarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.navy} />
            <Stop offset="1" stopColor={colors.magenta} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={BAR_WIDTH} height={BAR_HEIGHT} rx={1.2} fill="url(#sectionBarGrad)" />
      </Svg>
      <Text style={styles.heading}>{children}</Text>
    </View>
  )
}
