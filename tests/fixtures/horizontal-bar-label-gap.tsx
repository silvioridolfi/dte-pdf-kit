// Fixture para el bug: en HorizontalBarChart, un rótulo truncado con
// labelLines toca la barra (sin hueco) -- ver
// tests/chart-regressions.test.mjs. Un solo HorizontalBarChart por
// PDF, con Page sin padding, para que las coordenadas del bbox sean
// predecibles: "fuera de ChartCard" el origen del Svg es (0,0) de la
// página; "adentro de ChartCard" el origen es
// (chartCard.borderWidth + chartCard.padding).
import { writeFileSync } from 'node:fs'
import { Document, Page, renderToBuffer } from '@react-pdf/renderer'
import { HorizontalBarChart, ChartCard, ensureFontsRegistered } from '../../dist/index.js'

const out = process.argv[2]
const labelLines = Number(process.argv[3])
const size = process.argv[4]
const inCard = process.argv[5] === 'card'
const labelWidth = Number(process.argv[6] ?? 92)

ensureFontsRegistered()

const bars = [{ label: 'Prácticas Profesionalizantes', value: 42 }]

function Chart() {
  return (
    <HorizontalBarChart bars={bars} labelLines={labelLines} labelWidth={labelWidth} orientation="portrait" size={size} />
  )
}

function Fixture() {
  return inCard ? (
    <ChartCard title="Tarjeta" size={size} orientation="portrait">
      <Chart />
    </ChartCard>
  ) : (
    <Chart />
  )
}

const buffer = await renderToBuffer(
  <Document>
    <Page size="A4" style={{ padding: 0 }}>
      <Fixture />
    </Page>
  </Document>,
)
writeFileSync(out, buffer)
