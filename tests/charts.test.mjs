// Matriz de "reglas comunes" del pedido v0.5.0 (rev. 2) para los
// componentes de gráficos: sin datos, todo en 0, un solo dato,
// valores inválidos (-3/NaN/Infinity), label de 60 caracteres, 60
// barras/columnas, portrait y landscape, adentro y afuera de un
// ChartCard -- ninguno de estos casos puede tirar una excepción al
// renderizar, y el PDF resultante solo puede tener Encode Sans
// embebida (ver pdffonts).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { resolveChartWidth, usefulPageWidth, halfChartWidth } from '../dist/index.js'

function hasPoppler() {
  try {
    execFileSync('pdffonts', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function renderSmoke(outPath, orientation) {
  execFileSync(
    'node',
    [path.join(import.meta.dirname, 'fixtures', 'charts-smoke.mjs'), outPath, orientation],
    { stdio: 'inherit' },
  )
}

for (const orientation of ['portrait', 'landscape']) {
  test(
    `batería de gráficos (sin datos, 0, un dato, inválidos, label de 60, 60 ítems, en ChartCard) no crashea en ${orientation}`,
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
      const pdfPath = path.join(dir, 'smoke.pdf')
      assert.doesNotThrow(() => renderSmoke(pdfPath, orientation))
    },
  )
}

test(
  'los PDF de la batería de gráficos solo usan Encode Sans (pdffonts)',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
    const pdfPath = path.join(dir, 'smoke.pdf')
    renderSmoke(pdfPath, 'portrait')
    const fonts = execFileSync('pdffonts', [pdfPath], { encoding: 'utf8' })
    const fontLines = fonts
      .split('\n')
      .slice(2)
      .map((l) => l.trim())
      .filter(Boolean)
    for (const line of fontLines) {
      assert.match(line, /^[A-Z]+\+EncodeSans-/, `fuente inesperada (no Encode Sans): ${line}`)
    }
  },
)

test('resolveChartWidth: prioridad width explícito > ancho de ChartCard > ancho de página', () => {
  assert.equal(resolveChartWidth({ width: 123 }, 999), 123, 'width explícito gana siempre')
  assert.equal(resolveChartWidth({}, 200), 200, 'sin width, gana el ancho del ChartCard')
  assert.equal(
    resolveChartWidth({ orientation: 'portrait', size: 'full' }, null),
    usefulPageWidth('portrait'),
    'sin width ni ChartCard, ancho útil de página (full)',
  )
  assert.equal(
    resolveChartWidth({ orientation: 'landscape', size: 'half' }, null),
    halfChartWidth('landscape'),
    'sin width ni ChartCard, mitad del ancho útil de página (half)',
  )
})
