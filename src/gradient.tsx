import { Defs, LinearGradient, Stop } from '@react-pdf/renderer'
import { gradientBrand, gradientLineCoords } from './tokens.js'

/**
 * `<Defs>` con el degradé de marca del DTE ya resuelto en coordenadas
 * `userSpaceOnUse` para una caja de `width` x `height` -- ver
 * `gradientLineCoords` en tokens.ts para el porqué (el degradé por
 * defecto de SVG no da el mismo ángulo que un `linear-gradient` de CSS
 * en una caja que no es cuadrada). Cada lugar del kit que use el
 * degradé de marca (banda del header, línea bajo el título, barrita de
 * los H2) arma su `<Rect>`/`<Svg>` propio y solo necesita este bloque +
 * un `id` propio para no colisionar con otro degradé en la misma
 * página.
 */
export function BrandGradientDef({ id, width, height }: { id: string; width: number; height: number }) {
  const { x1, y1, x2, y2 } = gradientLineCoords(width, height)
  return (
    <Defs>
      <LinearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
        {gradientBrand.stops.map((stop) => (
          <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
        ))}
      </LinearGradient>
    </Defs>
  )
}
