import { View } from '@react-pdf/renderer'
import { colors } from './tokens.js'
import { toSafeNumber } from './numbers.js'

export type ProgressBarVariant = 'navy' | 'magenta' | 'teal'

const FILL_COLOR: Record<ProgressBarVariant, string> = {
  navy: colors.navy,
  magenta: colors.magenta,
  teal: colors.teal,
}

/** Barra de progreso: track clarito con relleno redondeado del color
 * pedido. `value` es un porcentaje (0-100), se recorta solo. */
export function ProgressBar({
  value,
  variant = 'navy',
  height = 4,
}: {
  value: number
  variant?: ProgressBarVariant
  height?: number
}) {
  const pct = Math.max(0, Math.min(100, toSafeNumber(value)))
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: colors.trackBg,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: height / 2,
          backgroundColor: FILL_COLOR[variant],
        }}
      />
    </View>
  )
}
