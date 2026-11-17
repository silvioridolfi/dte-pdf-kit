// Fixture de humo para tests/charts.test.mjs -- renderiza una batería
// de casos (sin datos, todo en 0, un solo dato, valores inválidos,
// labels de 60 caracteres, 60 columnas/barras) de StackedBar,
// HorizontalBarChart y ColumnChart, dentro y fuera de un ChartCard,
// en portrait y landscape. Si algo de esto tira una excepción durante
// el render, el test falla por el exit code no-cero de este proceso.
import { writeFileSync } from 'node:fs'
import { Document, Page, renderToBuffer } from '@react-pdf/renderer'
import {
  StackedBar,
  HorizontalBarChart,
  ColumnChart,
  ChartCard,
  ensureFontsRegistered,
} from '../../dist/index.js'

const out = process.argv[2]
const orientation = process.argv[3] ?? 'portrait'

ensureFontsRegistered()

const longLabel = 'Un nombre de distrito escolar bastante largo que ocupa sesenta caracteres aprox'.slice(0, 60)

const manyBars = Array.from({ length: 60 }, (_, i) => ({ label: `Grupo ${i + 1}`, value: i + 1 }))
const manyColumns = Array.from({ length: 60 }, (_, i) => ({ label: `S${i + 1}`, values: { a: i, b: 60 - i } }))

const series = [
  { key: 'a', label: 'Serie A' },
  { key: 'b', label: 'Serie B' },
]

function AllCases() {
  return (
    <Page size="A4" orientation={orientation}>
      {/* Sin datos */}
      <StackedBar segments={[]} />
      <HorizontalBarChart bars={[]} />
      <ColumnChart series={series} data={[]} />

      {/* Todo en 0 */}
      <StackedBar segments={[{ key: 'x', label: 'X', value: 0 }]} />
      <HorizontalBarChart bars={[{ label: 'X', value: 0 }]} />
      <ColumnChart series={series} data={[{ label: 'X', values: { a: 0, b: 0 } }]} />

      {/* Un solo dato */}
      <StackedBar segments={[{ key: 'x', label: 'X', value: 10 }]} />
      <HorizontalBarChart bars={[{ label: 'X', value: 10 }]} />
      <ColumnChart series={series} data={[{ label: 'X', values: { a: 10, b: 5 } }]} />

      {/* Valores inválidos: -3, NaN, Infinity */}
      <StackedBar
        segments={[
          { key: 'neg', label: 'Negativo', value: -3 },
          { key: 'nan', label: 'NaN', value: NaN },
          { key: 'inf', label: 'Infinito', value: Infinity },
          { key: 'ok', label: 'Normal', value: 10 },
        ]}
      />
      <HorizontalBarChart
        bars={[
          { label: 'Negativo', value: -3 },
          { label: 'NaN', value: NaN },
          { label: 'Infinito', value: Infinity },
          { label: 'Normal', value: 10 },
        ]}
      />
      <ColumnChart
        series={series}
        data={[{ label: 'X', values: { a: -3, b: NaN } }, { label: 'Y', values: { a: Infinity, b: 10 } }]}
      />

      {/* Label de 60 caracteres */}
      <HorizontalBarChart bars={[{ label: longLabel, value: 10 }]} labelLines={2} />
      <ColumnChart series={series} data={[{ label: longLabel, values: { a: 10, b: 5 } }]} />

      {/* 60 barras/columnas */}
      <HorizontalBarChart bars={manyBars} maxItems={10} sortBy="value-desc" />
      <ColumnChart series={series} data={manyColumns} />

      {/* Adentro de un ChartCard */}
      <ChartCard title="Adentro de una tarjeta" size="half" orientation={orientation}>
        <HorizontalBarChart bars={manyBars.slice(0, 5)} />
      </ChartCard>
      <ChartCard title="Columnas en tarjeta" size="half" orientation={orientation}>
        <ColumnChart series={series} data={manyColumns.slice(0, 5)} />
      </ChartCard>
    </Page>
  )
}

const buffer = await renderToBuffer(
  <Document>
    <AllCases />
  </Document>,
)
writeFileSync(out, buffer)
