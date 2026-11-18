// Fixture para el bug: ColumnChart dibuja "0" encima de una columna
// vacía (stacked) o de una serie en 0 (overlay) -- ver
// tests/chart-regressions.test.mjs.
import { writeFileSync } from 'node:fs'
import { Document, Page, renderToBuffer } from '@react-pdf/renderer'
import { ColumnChart, ensureFontsRegistered } from '../../dist/index.js'

const out = process.argv[2]
const mode = process.argv[3]

ensureFontsRegistered()

function Fixture() {
  if (mode === 'stacked') {
    return (
      <ColumnChart
        series={[{ key: 'a', label: 'A' }]}
        data={[
          { label: 'Jun', values: { a: 0 } },
          { label: 'Jul', values: { a: 10 } },
        ]}
        ticks={1}
      />
    )
  }
  // overlay: la serie "b" (la que se etiqueta) vale 0 en esta columna,
  // aunque la serie "a" valga 5 -- no debería dibujar "0".
  return (
    <ColumnChart
      mode="overlay"
      series={[
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ]}
      data={[{ label: 'X', values: { a: 5, b: 0 } }]}
      overlayLabelSeries="b"
      ticks={1}
    />
  )
}

const buffer = await renderToBuffer(
  <Document>
    <Page size="A4">
      <Fixture />
    </Page>
  </Document>,
)
writeFileSync(out, buffer)
