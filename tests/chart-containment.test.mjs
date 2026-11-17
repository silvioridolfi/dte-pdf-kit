// Test obligatorio del pedido: un HorizontalBarChart/StackedBar/
// ColumnChart size="half" adentro de un ChartCard size="half" no se
// puede desbordar de la tarjeta, en portrait y landscape. Se verifica
// con pdftotext -bbox: ninguna palabra que pertenezca a la tarjeta
// izquierda puede terminar más allá de su borde derecho.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pageMargins, halfChartWidth } from '../dist/index.js'

function hasPoppler() {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function bboxWords(pdfPath) {
  const xml = execFileSync('pdftotext', ['-bbox', pdfPath, '-'], { encoding: 'utf8' })
  const words = []
  for (const m of xml.matchAll(/<word xMin="(-?[\d.]+)" yMin="(-?[\d.]+)" xMax="(-?[\d.]+)" yMax="(-?[\d.]+)">/g)) {
    words.push({ xMin: Number(m[1]), xMax: Number(m[3]) })
  }
  return words
}

for (const orientation of ['portrait', 'landscape']) {
  test(
    `HorizontalBarChart/StackedBar/ColumnChart size="half" no se desbordan de su ChartCard (${orientation})`,
    { skip: !hasPoppler() && 'poppler-utils no está instalado' },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
      const pdfPath = path.join(dir, 'containment.pdf')
      execFileSync(
        'node',
        [path.join(import.meta.dirname, 'fixtures', 'chart-containment.mjs'), pdfPath, orientation],
        { stdio: 'inherit' },
      )

      const rightEdge = pageMargins.side + halfChartWidth(orientation)
      const tolerance = 1 // redondeo de layout, no desborde real
      const words = bboxWords(pdfPath)
      const leftCardWords = words.filter((w) => w.xMin < rightEdge)

      assert.ok(leftCardWords.length > 0, 'no se encontró texto de la tarjeta izquierda')
      for (const w of leftCardWords) {
        assert.ok(
          w.xMax <= rightEdge + tolerance,
          `una palabra de la tarjeta izquierda se desborda: xMax=${w.xMax}, borde=${rightEdge}`,
        )
      }
    },
  )
}
