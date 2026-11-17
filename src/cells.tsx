import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, mm, weight } from './tokens.js'

const styles = StyleSheet.create({
  // Distrito
  distritoPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.distritoBg,
    borderRadius: mm(2),
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  distritoText: {
    fontFamily,
    fontWeight: weight.semiBold,
    fontSize: 6.6,
    color: colors.distritoText,
    textTransform: 'uppercase',
  },

  // Cantidad con mini barra + número
  equiposWrap: { width: '100%', alignItems: 'center' },
  equiposValue: { fontFamily, fontWeight: weight.bold, fontSize: 9, color: colors.text, marginBottom: 2 },
  equiposBarTrack: {
    width: '80%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.trackBg,
    overflow: 'hidden',
  },
  equiposBarFill: { height: '100%', borderRadius: 1.5, backgroundColor: colors.teal },

  // Derivados
  derivValue: { fontFamily, fontWeight: weight.extraBold, fontSize: 9, color: colors.magenta },
  derivZero: { fontFamily, fontWeight: weight.regular, fontSize: 9, color: colors.textMuted },

  // Ranking
  rankCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCircleRest: { backgroundColor: colors.trackBg },
  rankText: { fontFamily, fontWeight: weight.extraBold, fontSize: 8 },
  rankTextOnDark: { color: colors.white },
  rankTextRest: { color: colors.textSecondary },

  // % con mini barra + número
  asistWrap: { width: '100%', alignItems: 'center' },
  asistValue: { fontFamily, fontWeight: weight.bold, fontSize: 9, marginBottom: 2 },
  asistBarTrack: {
    width: '80%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.trackBg,
    overflow: 'hidden',
  },
  asistBarFill: { height: '100%', borderRadius: 1.5 },

  // Puntos
  puntosValue: { fontFamily, fontWeight: weight.extraBold, fontSize: 11, color: colors.navy },
  puntosDetail: { fontFamily, fontWeight: weight.regular, fontSize: 6.2, color: colors.textMuted, marginTop: 1 },

  // Título + detalle en gris chico, dos líneas
  tituloDetalleTitulo: { fontFamily, fontWeight: weight.semiBold, fontSize: 8.5, color: colors.text },
  tituloDetalleDetail: { fontFamily, fontWeight: weight.regular, fontSize: 6.8, color: colors.textMuted, marginTop: 1 },

  // Chips (insignias, etiquetas, etc.)
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  chip: {
    backgroundColor: colors.insigniaBg,
    borderRadius: mm(2),
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  chipSpecial: {
    backgroundColor: colors.asistenciaPerfectaBg,
    borderRadius: mm(2),
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  chipText: { fontFamily, fontWeight: weight.semiBold, fontSize: 6.6, color: colors.navy },
  chipTextSpecial: { fontFamily, fontWeight: weight.semiBold, fontSize: 6.6, color: colors.magenta },
  chipsEmpty: { fontFamily, fontWeight: weight.regular, fontSize: 8, color: colors.textMuted },
})

/** Distrito (o cualquier otro dato geográfico/categórico corto) como
 * píldora celeste en mayúsculas. */
export function DistritoPill({ children }: { children: string }) {
  return (
    <View style={styles.distritoPill}>
      <Text style={styles.distritoText}>{children}</Text>
    </View>
  )
}

/** Cantidad con una mini barra proporcional al máximo de la tabla
 * (`max`) -- da una referencia visual rápida de qué fila pesa más sin
 * tener que leer los números uno por uno. */
export function CantidadCell({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <View style={styles.equiposWrap}>
      <Text style={styles.equiposValue}>{value}</Text>
      <View style={styles.equiposBarTrack}>
        <View style={[styles.equiposBarFill, { width: `${pct}%` }]} />
      </View>
    </View>
  )
}

/** Alias histórico de CantidadCell -- mismo componente, nombre pensado
 * para cuando la cantidad es de equipos/OTs. */
export const EquiposCell = CantidadCell

/** Valor que se destaca (magenta y en negrita) si es mayor a 0, y
 * queda apagado si es 0 -- un 0 no necesita llamar la atención, un
 * número positivo sí (ej. derivados, alertas, pendientes). */
export function DestacarSiPositivoCell({ value }: { value: number }) {
  return <Text style={value > 0 ? styles.derivValue : styles.derivZero}>{value}</Text>
}

/** Alias histórico. */
export const DerivCell = DestacarSiPositivoCell

/** Círculo numerado de ranking: 1° magenta, 2° navy, 3° teal, el resto
 * gris claro (oro/plata/bronce quedó para las tarjetas de KPI). */
export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <View style={[styles.rankCircle, { backgroundColor: colors.magenta }]}>
        <Text style={[styles.rankText, styles.rankTextOnDark]}>{rank}</Text>
      </View>
    )
  }
  if (rank === 2) {
    return (
      <View style={[styles.rankCircle, { backgroundColor: colors.navy }]}>
        <Text style={[styles.rankText, styles.rankTextOnDark]}>{rank}</Text>
      </View>
    )
  }
  if (rank === 3) {
    return (
      <View style={[styles.rankCircle, { backgroundColor: colors.teal }]}>
        <Text style={[styles.rankText, styles.rankTextOnDark]}>{rank}</Text>
      </View>
    )
  }
  return (
    <View style={[styles.rankCircle, styles.rankCircleRest]}>
      <Text style={[styles.rankText, styles.rankTextRest]}>{rank}</Text>
    </View>
  )
}

/** Porcentaje con mini barra: navy si llega al umbral (75% por
 * defecto) o más, magenta si está por debajo. */
export function PorcentajeCell({ pct, umbral = 75 }: { pct: number; umbral?: number }) {
  const ok = pct >= umbral
  const tone = ok ? colors.navy : colors.magenta
  return (
    <View style={styles.asistWrap}>
      <Text style={[styles.asistValue, { color: tone }]}>{pct}%</Text>
      <View style={styles.asistBarTrack}>
        <View style={[styles.asistBarFill, { width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: tone }]} />
      </View>
    </View>
  )
}

/** Alias histórico. */
export const AsistenciaCell = PorcentajeCell

/** Número grande y, debajo, un detalle chico en gris (ej. "OT 525 +
 * Asist. 320") -- el total pesa, el desglose acompaña sin competirle. */
export function PuntosCell({ total, detail }: { total: number | string; detail?: string }) {
  return (
    <View>
      <Text style={styles.puntosValue}>{total}</Text>
      {detail && <Text style={styles.puntosDetail}>{detail}</Text>}
    </View>
  )
}

/** Lista de chips, con una variante especial por nombre (ej. para
 * destacar un logro en particular dentro de una lista de insignias).
 * "--" si la lista está vacía. */
export function Chips({ items, special }: { items: string[]; special?: string }) {
  if (items.length === 0) {
    return <Text style={styles.chipsEmpty}>--</Text>
  }
  return (
    <View style={styles.chipsWrap}>
      {items.map((label) => {
        const isSpecial = label === special
        return (
          <View key={label} style={isSpecial ? styles.chipSpecial : styles.chip}>
            <Text style={isSpecial ? styles.chipTextSpecial : styles.chipText}>{label}</Text>
          </View>
        )
      })}
    </View>
  )
}

/** Alias histórico: insignias, con "Asistencia perfecta" como la
 * variante especial por defecto (es el nombre que usan las apps que
 * ya consumían este componente). */
export function InsigniaChips({ items }: { items: string[] }) {
  return <Chips items={items} special="Asistencia perfecta" />
}

/** Celda de dos líneas: título en negrita y, debajo, un detalle chico
 * en gris (ej. nombre de escuela + CUE y dirección). `DataTable` ya
 * acepta cualquier `ReactNode` por celda -- esto es solo el armado
 * visual estándar para cuando una fila necesita ese detalle de apoyo. */
export function TituloConDetalleCell({ titulo, detail }: { titulo: string; detail?: string }) {
  return (
    <View>
      <Text style={styles.tituloDetalleTitulo}>{titulo}</Text>
      {detail && <Text style={styles.tituloDetalleDetail}>{detail}</Text>}
    </View>
  )
}
