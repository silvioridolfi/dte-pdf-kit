// Bug de v0.5.1: HorizontalBarChart truncaba el rótulo (fitText/
// wrapText) contra `labelWidth` a secas, en vez de contra el ancho
// REAL disponible (`labelWidth - LABEL_BAR_GAP`) -- el resultado
// podía quedar pegado justo donde arranca la barra, sin dejar lugar
// para que se note el corte.
//
// Test unitario (sin generar PDF): el rótulo final (ya truncado, con
// "…" si hizo falta) nunca puede medir más que `labelWidth -
// LABEL_BAR_GAP`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { textWidth } from '../dist/index.js'
import { computeBarLabelLines, LABEL_BAR_GAP } from '../dist/BarChart.js'

const STYLE = { size: 8, weight: 400 }
const COLUMN_WIDTH = 143 // el ancho de columna real del bug reportado

const LABELS = [
  'Corto diez'.slice(0, 10), // 10 caracteres
  'Un rótulo de treinta caracteres'.slice(0, 30), // 30 caracteres
  'Un rótulo bastante largo de sesenta caracteres en total aprox'.slice(0, 60), // 60 caracteres
  'Prácticas Profesionalizantes', // el caso real del bug
]

for (const labelLines of [1, 2]) {
  for (const label of LABELS) {
    test(`computeBarLabelLines (labelLines=${labelLines}) nunca mide más que labelWidth - LABEL_BAR_GAP: "${label}"`, () => {
      const availableWidth = COLUMN_WIDTH - LABEL_BAR_GAP
      const lines = computeBarLabelLines(label, COLUMN_WIDTH, labelLines)
      for (const line of lines) {
        const w = textWidth(line, STYLE)
        assert.ok(
          w <= availableWidth,
          `"${line}" mide ${w}pt, debería medir como máximo ${availableWidth}pt (labelWidth=${COLUMN_WIDTH} - LABEL_BAR_GAP=${LABEL_BAR_GAP})`,
        )
      }
    })
  }
}
