// Fixture para el pedido v0.5.3: margen superior de la hoja 1 sin
// barra -- ver tests/first-page-margin.test.mjs. Arma un ReportHero
// como primer contenido y, si se pide más de una hoja, fuerza el
// quiebre a la hoja 2 con `break` (en vez de rellenar con líneas
// hasta que desborde solo) para que la posición del primer contenido
// de la hoja 2 sea 100% predecible y comparable entre versiones,
// sin depender de cuántas líneas entraron en la hoja 1.
import { writeFileSync } from 'node:fs'
import { Document, Text, renderToBuffer } from '@react-pdf/renderer'
import { PdfPage, ReportHero } from '../../dist/index.js'

const out = process.argv[2]
const orientation = process.argv[3]
const headerMode = process.argv[4]
const pages = process.argv[5] ?? '1'

function Fixture() {
  return (
    <PdfPage header={headerMode} orientation={orientation}>
      <ReportHero eyebrow="REGIÓN 1" title="Resumen" orientation={orientation} />
      <Text>Contenido de la hoja 1.</Text>
      {pages === '2' && (
        <Text break>MARCADOR_HOJA_2</Text>
      )}
    </PdfPage>
  )
}

const buffer = await renderToBuffer(
  <Document>
    <Fixture />
  </Document>,
)
writeFileSync(out, buffer)
