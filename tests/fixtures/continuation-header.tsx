// Fixture para tests/continuation-header.test.mjs -- se bundlea a JS
// con esbuild (ver "pretest" en package.json) porque los tests corren
// con node --test plano, sin loader de TSX.
import { writeFileSync } from 'node:fs'
import { Document, Text, renderToBuffer } from '@react-pdf/renderer'
import { PdfPage } from '../../dist/index.js'

const out = process.argv[2]
const pages = Number(process.argv[3] ?? 3)

function Reporte() {
  return (
    <PdfPage header="afterFirstPage" headerTitle="Dirección de Tecnología Educativa">
      {Array.from({ length: pages > 1 ? 70 : 1 }, (_, i) => (
        <Text key={i} style={{ marginBottom: 6 }}>
          Línea de relleno {i} para forzar varias hojas si pages {'>'} 1.
        </Text>
      ))}
    </PdfPage>
  )
}

const buffer = await renderToBuffer(
  <Document>
    <Reporte />
  </Document>,
)
writeFileSync(out, buffer)
