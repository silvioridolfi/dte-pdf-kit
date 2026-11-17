/**
 * dte-pdf-kit
 *
 * Kit de diseño PDF del DTE para @react-pdf/renderer -- tokens,
 * tipografía y componentes reutilizables entre apps con identidad DTE.
 * Cualquier informe PDF se arma SOLO con lo que exporta este módulo:
 * ningún informe define su propio color, tamaño de fuente, degradé de
 * header/footer o estilo de tabla. Si hace falta algo que el kit no
 * tiene todavía, se agrega ACÁ (versión nueva del paquete), nunca
 * copiado y pegado adentro de la app que lo consume.
 *
 * Ver README.md ("Cómo agregar un reporte nuevo") para el ejemplo
 * completo.
 */

export * from './tokens.js'
export * from './numbers.js'
export * from './fonts.js'
export * from './gradient.js'
export * from './Text.js'
export * from './PdfPage.js'
export * from './ReportHero.js'
export * from './ReportTitle.js'
export * from './SectionTitle.js'
export * from './KpiCard.js'
export * from './ProgressBar.js'
export * from './StatusChips.js'
export * from './DataTable.js'
export * from './cells.js'
export * from './BarChart.js'
export * from './Note.js'
export * from './text-metrics.js'
