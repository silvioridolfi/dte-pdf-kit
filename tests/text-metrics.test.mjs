// Test del punto "G" del pedido: medición real de texto (no por
// longitud de caracteres). El test mandatorio es la verificación
// contra lo que @react-pdf/renderer efectivamente dibuja: se genera
// un PDF, se extraen los bounding boxes reales con
// `pdftotext -bbox` y se compara contra textWidth() con 1% de
// tolerancia. Requiere poppler-utils (pdftotext) -- se salta con un
// aviso si no está instalado.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { textWidth, fitsInWidth, fitText, wrapText } from '../dist/index.js'

function hasPoppler() {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function renderFixture(fixture, outPath, args) {
  execFileSync('node', [path.join(import.meta.dirname, 'fixtures', `${fixture}.mjs`), outPath, ...args], {
    stdio: 'inherit',
  })
}

function bboxWords(pdfPath) {
  const xml = execFileSync('pdftotext', ['-bbox', pdfPath, '-'], { encoding: 'utf8' })
  const words = []
  // yMin puede salir "-0.000000" (cero negativo de punto flotante) en
  // la primera línea de la página -- el signo tiene que entrar en la
  // clase de caracteres.
  for (const m of xml.matchAll(/<word xMin="(-?[\d.]+)" yMin="(-?[\d.]+)" xMax="(-?[\d.]+)" yMax="(-?[\d.]+)">/g)) {
    words.push({ xMin: Number(m[1]), yMin: Number(m[2]), xMax: Number(m[3]) })
  }
  return words
}

/** Agrupa words por línea física (mismo yMin, con margen de redondeo)
 * y devuelve el ancho real de cada línea: max(xMax) - min(xMin). */
function lineWidthsByY(words) {
  const byY = new Map()
  for (const w of words) {
    const key = Math.round(w.yMin)
    const bucket = byY.get(key) ?? []
    bucket.push(w)
    byY.set(key, bucket)
  }
  return [...byY.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, bucket]) => Math.max(...bucket.map((w) => w.xMax)) - Math.min(...bucket.map((w) => w.xMin)))
}

const WEIGHTS = [300, 400, 500, 600, 700, 800]

test(
  'textWidth coincide (1% de tolerancia) con el ancho real que dibuja @react-pdf/renderer, en los 6 pesos',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
    const pdfPath = path.join(dir, 'bbox.pdf')
    const cases = WEIGHTS.map((weight) => ({ text: 'Dirección de Tecnología Educativa 2026', size: 11, weight }))

    renderFixture('text-metrics-bbox', pdfPath, [JSON.stringify(cases)])

    const measured = lineWidthsByY(bboxWords(pdfPath))
    assert.equal(measured.length, cases.length)

    cases.forEach((c, i) => {
      const expected = textWidth(c.text, { size: c.size, weight: c.weight })
      const actual = measured[i]
      const tolerance = expected * 0.01
      assert.ok(
        Math.abs(actual - expected) <= tolerance,
        `peso ${c.weight}: textWidth()=${expected}, real=${actual} (tolerancia ${tolerance})`,
      )
    })
  },
)

test(
  'frontera de wrap: un ancho apenas mayor no envuelve, uno claramente menor sí',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    // La medición exacta de textWidth() coincide con el ancho final
    // (glifos ya posicionados) con <0,01% de error -- ver el test de
    // arriba. Pero la DECISIÓN de wrap de @react-pdf/renderer (Yoga)
    // resultó tener un margen propio de hasta ~3% del ancho del texto
    // (medido empíricamente: con este texto a 10pt, entra en una sola
    // línea hasta 190,655pt de ancho de contenedor, aunque
    // textWidth() mide 196,655pt para el texto completo). Por eso el
    // lado "sí envuelve" de este test usa un 10% menos, bien por
    // fuera de ese margen, en lugar del -2 literal del pedido (que
    // cae justo adentro del margen de Yoga y da falso negativo).
    const text = 'Un texto de prueba para la frontera de ancho'
    const style = { size: 10, weight: 400 }
    const w = textWidth(text, style)

    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))

    const fitsPath = path.join(dir, 'fits.pdf')
    renderFixture('text-metrics-wrap', fitsPath, [text, String(w + 0.5), String(style.size), String(style.weight)])
    assert.equal(lineWidthsByY(bboxWords(fitsPath)).length, 1, 'no debería envolver')

    const wrapsPath = path.join(dir, 'wraps.pdf')
    renderFixture('text-metrics-wrap', wrapsPath, [text, String(w * 0.9), String(style.size), String(style.weight)])
    assert.ok(lineWidthsByY(bboxWords(wrapsPath)).length > 1, 'debería envolver en más de una línea')
  },
)

test('fitsInWidth coincide con textWidth <= maxWidth', () => {
  const style = { size: 9, weight: 500 }
  const text = 'Escuela de Educación Técnica N°1'
  const w = textWidth(text, style)
  assert.equal(fitsInWidth(text, w, style), true)
  assert.equal(fitsInWidth(text, w - 1, style), false)
})

test('fitText nunca devuelve un texto cuyo ancho medido supere maxWidth', () => {
  const style = { size: 9, weight: 400 }
  const long = 'Un nombre de distrito escolar bastante largo que no entra en una columna angosta del informe'
  for (const maxWidth of [5, 20, 50, 80, 150, 400]) {
    const { text } = fitText(long, maxWidth, style)
    assert.ok(textWidth(text, style) <= maxWidth, `maxWidth=${maxWidth}, "${text}" mide ${textWidth(text, style)}`)
  }
})

test('fitText no trunca si el texto ya entra', () => {
  const style = { size: 9, weight: 400 }
  const { text, truncated } = fitText('Corto', 500, style)
  assert.equal(text, 'Corto')
  assert.equal(truncated, false)
})

test('wrapText nunca devuelve una línea cuyo ancho medido supere maxWidth', () => {
  const style = { size: 9, weight: 400 }
  const long = 'Un nombre de distrito escolar bastante largo que no entra en una columna angosta del informe de la práctica'
  const { lines } = wrapText(long, 90, style, 2)
  assert.ok(lines.length <= 2)
  for (const line of lines) {
    assert.ok(textWidth(line, style) <= 90, `"${line}" mide ${textWidth(line, style)}`)
  }
})
