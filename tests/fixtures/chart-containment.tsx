// Fixture para el test de contención obligatorio del pedido: un
// HorizontalBarChart/StackedBar/ColumnChart size="half" adentro de un
// ChartCard size="half" no se puede desbordar de la tarjeta.
import { writeFileSync } from 'node:fs'
import { Document, Page, View, renderToBuffer } from '@react-pdf/renderer'
import {
  HorizontalBarChart,
  StackedBar,
  ColumnChart,
  ChartCard,
  ChartGrid,
  ensureFontsRegistered,
  pageMargins,
} from '../../dist/index.js'

const out = process.argv[2]
const orientation = process.argv[3]

ensureFontsRegistered()

const longLabel = 'Un nombre de distrito escolar municipal bastante largo para forzar el desborde'
const series = [
  { key: 'a', label: 'Serie A con nombre largo' },
  { key: 'b', label: 'Serie B' },
]

function Fixture() {
  return (
    <Page size="A4" orientation={orientation} style={{ paddingTop: pageMargins.side, paddingLeft: pageMargins.side, paddingRight: pageMargins.side }}>
      <View>
        <ChartGrid>
          <ChartCard title="Barras horizontales en media tarjeta" size="half" orientation={orientation}>
            <HorizontalBarChart
              bars={[
                { label: longLabel, value: 100 },
                { label: 'Corto', value: 40 },
              ]}
              labelLines={2}
            />
          </ChartCard>
          <ChartCard title="Barra apilada en media tarjeta" size="half" orientation={orientation}>
            <StackedBar
              segments={[
                { key: 'a', label: longLabel, value: 60 },
                { key: 'b', label: 'Corto', value: 40 },
              ]}
            />
          </ChartCard>
        </ChartGrid>
        <ChartGrid>
          <ChartCard title="Columnas en media tarjeta" size="half" orientation={orientation}>
            <ColumnChart series={series} data={[{ label: longLabel, values: { a: 50, b: 30 } }]} />
          </ChartCard>
        </ChartGrid>
      </View>
    </Page>
  )
}

const buffer = await renderToBuffer(
  <Document>
    <Fixture />
  </Document>,
)
writeFileSync(out, buffer)
