import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, mm, weight } from './tokens.js'
import { toSafeNumber } from './numbers.js'

export type StatusChipKind = 'done' | 'derived' | 'pending'

export type StatusChipItem = {
  key: string
  label: string
  count: number
  kind: StatusChipKind
}

const KIND_BAR_COLOR: Record<StatusChipKind, string> = {
  done: colors.navy,
  derived: colors.magenta,
  pending: colors.teal,
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.trackBg, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: {
    width: '10.6%',
    borderRadius: mm(2),
    borderWidth: 0.75,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  chipFilled: { borderWidth: 0 },
  value: { fontFamily, fontWeight: weight.extraBold, fontSize: 13, color: colors.navy },
  valueOnDark: { color: colors.white },
  label: { fontFamily, fontWeight: weight.medium, fontSize: 6.8, color: colors.textSecondary, marginTop: 2 },
  labelOnDark: { color: colors.white },
})

/**
 * Desglose por estado: una barra apilada proporcional arriba (de un
 * vistazo, qué proporción del total está en cada categoría) y, debajo,
 * un chip por estado con su cantidad -- "done" y "derived" van
 * rellenos (navy/magenta) para que resalten contra el resto, que queda
 * en un chip claro con acento teal en la barra ("pending").
 */
export function StatusChips({ items }: { items: StatusChipItem[] }) {
  const counts = items.map((i) => toSafeNumber(i.count))
  const total = Math.max(1, counts.reduce((acc, c) => acc + c, 0))

  return (
    <View>
      <View style={styles.bar}>
        {items
          .map((i, idx) => ({ item: i, count: counts[idx] }))
          .filter(({ count }) => count > 0)
          .map(({ item, count }) => (
            <View
              key={item.key}
              style={{ width: `${(count / total) * 100}%`, backgroundColor: KIND_BAR_COLOR[item.kind] }}
            />
          ))}
      </View>
      <View style={styles.grid}>
        {items.map((i, idx) => {
          const filled = i.kind === 'done' || i.kind === 'derived'
          return (
            <View
              key={i.key}
              style={[
                styles.chip,
                filled ? styles.chipFilled : undefined,
                filled ? { backgroundColor: i.kind === 'done' ? colors.navy : colors.magenta } : undefined,
              ]}
            >
              <Text style={[styles.value, filled ? styles.valueOnDark : undefined]}>{counts[idx]}</Text>
              <Text style={[styles.label, filled ? styles.labelOnDark : undefined]}>{i.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
