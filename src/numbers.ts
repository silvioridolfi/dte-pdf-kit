/**
 * Saneamiento de números para los componentes del kit que reciben un
 * valor numérico desde afuera (viene de una consulta, un cálculo, o un
 * dato mal cargado) y lo tienen que poder mostrar sin romper el
 * layout ni mostrar literalmente "NaN"/"Infinity" en un PDF.
 *
 * Dos variantes, porque el comportamiento correcto depende del
 * componente:
 *
 * - `toSafeNumber`: para los componentes existentes (ProgressBar,
 *   StatusChips, CantidadCell, PorcentajeCell,
 *   DestacarSiPositivoCell, PuntosCell, RankBadge, KpiCard) --
 *   solo NaN/Infinity/-Infinity/null/undefined pasan a 0, un número
 *   negativo válido se conserva (puede tener sentido, ej. una
 *   diferencia contra la etapa anterior).
 * - `toSafeChartNumber`: para los componentes de gráficos nuevos
 *   (StackedBar, HorizontalBarChart, ColumnChart) -- además recorta
 *   los negativos a 0, porque un valor negativo no tiene una
 *   representación razonable en una barra o columna.
 */
export function toSafeNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return value
}

export function toSafeChartNumber(value: unknown): number {
  const n = toSafeNumber(value)
  return n < 0 ? 0 : n
}
