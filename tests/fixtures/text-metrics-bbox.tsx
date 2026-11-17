// Fixture para tests/text-metrics.test.mjs -- renderiza una lista de
// textos de prueba, uno por línea, en una posición conocida, para que
// el test pueda extraer sus bounding boxes reales con
// `pdftotext -bbox` y comparar contra lo que mide textWidth().
import { writeFileSync } from 'node:fs'
import { Document, Page, Text as PdfText, View, renderToBuffer } from '@react-pdf/renderer'
import { ensureFontsRegistered, fontFamily } from '../../dist/index.js'

const out = process.argv[2]
const casesJson = process.argv[3]
const cases: { text: string; size: number; weight: number }[] = JSON.parse(casesJson)

ensureFontsRegistered()

function Fixture() {
  return (
    <Document>
      <Page size="A4" style={{ padding: 0 }}>
        <View>
          {cases.map((c, i) => (
            <PdfText
              key={i}
              style={{
                fontFamily,
                fontWeight: c.weight,
                fontSize: c.size,
                position: 'absolute',
                top: i * 40,
                left: 0,
              }}
            >
              {c.text}
            </PdfText>
          ))}
        </View>
      </Page>
    </Document>
  )
}

const buffer = await renderToBuffer(<Fixture />)
writeFileSync(out, buffer)
