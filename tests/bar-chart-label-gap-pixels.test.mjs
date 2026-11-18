// Tercer test del bug de v0.5.1 (rótulo truncado pegado a la barra):
// rasteriza la hoja de prueba y comprueba que la franja reservada
// como hueco (LABEL_BAR_GAP, justo antes de donde arranca la barra)
// queda en blanco puro -- sin tinta de texto ni del track de la
// barra mezclada ahí. A diferencia de pdftotext (texto u bbox), esto
// mira los píxeles reales, que es donde se nota el solapamiento
// visual. Requiere poppler-utils (pdftoppm) e ImageMagick (convert,
// compare) -- se salta si no están instalados.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { LABEL_BAR_GAP } from '../dist/BarChart.js'

function hasTools() {
  try {
    execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' })
    execFileSync('convert', ['-version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const TRUNCATING_LABEL_WIDTH = 90
const DPI = 300
const PT_TO_PX = DPI / 72

function renderFixture(outPath, args) {
  execFileSync(
    'node',
    [path.join(import.meta.dirname, 'fixtures', 'horizontal-bar-label-gap.mjs'), outPath, ...args],
    { stdio: 'inherit' },
  )
}

for (const labelLines of [1, 2]) {
  test(
    `HorizontalBarChart: la franja del hueco antes de la barra queda en blanco (sin texto ni barra mezclados), labelLines=${labelLines}`,
    { skip: !hasTools() && 'poppler-utils/ImageMagick no están instalados' },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
      const pdfPath = path.join(dir, 'label-gap-pixels.pdf')
      renderFixture(pdfPath, [
        String(labelLines),
        'full',
        'no-card',
        String(TRUNCATING_LABEL_WIDTH),
        'portrait',
      ])

      execFileSync('pdftoppm', ['-png', '-r', String(DPI), '-f', '1', '-l', '1', pdfPath, path.join(dir, 'page')])
      const pagePng = path.join(dir, 'page-1.png')

      const contentBoxX = 0 // 'no-card', página sin padding
      const barStartX = contentBoxX + TRUNCATING_LABEL_WIDTH
      const gapX0 = (barStartX - LABEL_BAR_GAP) * PT_TO_PX
      const gapWidth = LABEL_BAR_GAP * PT_TO_PX
      // Alto generoso: cubre tanto el caso de 1 línea como el de 2.
      const stripHeight = 24 * PT_TO_PX

      const stripPng = path.join(dir, 'strip.png')
      execFileSync('convert', [
        pagePng,
        '-crop',
        `${Math.round(gapWidth)}x${Math.round(stripHeight)}+${Math.round(gapX0)}+0`,
        '+repage',
        stripPng,
      ])

      const whitePng = path.join(dir, 'white.png')
      execFileSync('convert', [
        '-size',
        `${Math.round(gapWidth)}x${Math.round(stripHeight)}`,
        'xc:white',
        whitePng,
      ])

      const diffPng = path.join(dir, 'diff.png')
      let diffingPixels = 0
      try {
        execFileSync('compare', ['-metric', 'AE', stripPng, whitePng, diffPng], { stdio: 'pipe' })
      } catch (err) {
        // `compare` sale con código != 0 cuando hay diferencias -- el
        // conteo de píxeles distintos viene en stderr.
        diffingPixels = Number(err.stderr?.toString().trim() ?? NaN)
      }

      const totalPixels = Math.round(gapWidth) * Math.round(stripHeight)
      const tolerance = totalPixels * 0.01 // 1% para antialiasing en los bordes del recorte
      assert.ok(
        Number.isFinite(diffingPixels) && diffingPixels <= tolerance,
        `la franja del hueco tiene ${diffingPixels} píxeles que no son blanco puro (de ${totalPixels}, tolerancia ${tolerance}) -- labelLines=${labelLines}`,
      )
    },
  )
}
