import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, mm, weight } from './tokens.js'
import { MultilineText } from './Text.js'

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.cardBg,
    borderWidth: 0.75,
    borderColor: colors.border,
    borderRadius: mm(2.5),
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  title: {
    fontFamily,
    fontWeight: weight.bold,
    fontSize: 8,
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  body: { fontFamily, fontWeight: weight.regular, fontSize: 8.5, color: colors.text, lineHeight: 1.35 },
})

/**
 * Bloque de nota o párrafo final, para el cierre de un informe
 * (aclaraciones, metodología, observaciones). Título chico en
 * mayúsculas (`"Nota"` por defecto) + párrafo, con `MultilineText`
 * por debajo para que un párrafo con `\n` no caiga a Helvetica.
 */
export function Note({ title = 'Nota', children }: { title?: string; children: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <MultilineText style={styles.body}>{children}</MultilineText>
    </View>
  )
}
