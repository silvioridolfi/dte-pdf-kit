// Fixture para el bug: con valores enteros, el eje Y de ColumnChart
// no debería mostrar pasos fraccionarios (ej. 0,5) -- ver
// tests/chart-regressions.test.mjs.
import { writeFileSync } from 'node:fs'
import { Document, Page, renderToBuffer } from '@react-pdf/renderer'
import { ColumnChart, ensureFontsRegistered } from '../../dist/index.js'

const out = process.argv[2]
const maxValue = Number(process.argv[3])

ensureFontsRegistered()

const buffer = await renderToBuffer(
  <Document>
    <Page size="A4">
      <ColumnChart series={[{ key: 'a', label: 'A' }]} data={[{ label: 'X', values: { a: maxValue } }]} />
    </Page>
  </Document>,
)
writeFileSync(out, buffer)
