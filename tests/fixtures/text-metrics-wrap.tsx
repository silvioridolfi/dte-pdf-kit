// Fixture para el test de frontera de wrap/no-wrap de text-metrics:
// un único <Text> adentro de una <View> de ancho fijo, para que el
// test cuente cuántas líneas físicas terminó ocupando (vía
// pdftotext -bbox, agrupando por yMin).
import { writeFileSync } from 'node:fs'
import { Document, Page, Text as PdfText, View, renderToBuffer } from '@react-pdf/renderer'
import { ensureFontsRegistered, fontFamily } from '../../dist/index.js'

const out = process.argv[2]
const text = process.argv[3]
const width = Number(process.argv[4])
const size = Number(process.argv[5])
const weight = Number(process.argv[6])

ensureFontsRegistered()

function Fixture() {
  return (
    <Document>
      <Page size="A4" style={{ padding: 0 }}>
        <View style={{ width }}>
          <PdfText style={{ fontFamily, fontWeight: weight, fontSize: size }}>{text}</PdfText>
        </View>
      </Page>
    </Document>
  )
}

const buffer = await renderToBuffer(<Fixture />)
writeFileSync(out, buffer)
