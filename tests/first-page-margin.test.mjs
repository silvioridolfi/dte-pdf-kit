// Pedido v0.5.3: con header="afterFirstPage", el margen superior de
// la hoja 1 pasa de 29mm a 17mm (sin la barra fina que ya no existe
// ahí desde la v0.5.2) -- las hojas 2 en adelante conservan 29mm y la
// barra, y los demás modos de header no cambian. Todo medido con
// `pdftotext -bbox` sobre PDF generados con el kit.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pageMargins } from '../dist/index.js'

const HEADER_TEXT = 'Dirección de Tecnología Educativa'

function hasPoppler() {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function renderFixture(outPath, args) {
  execFileSync('node', [path.join(import.meta.dirname, 'fixtures', 'first-page-margin.mjs'), outPath, ...args], {
    stdio: 'inherit',
  })
}

function bbox(pdfPath, page) {
  const xml = execFileSync('pdftotext', ['-bbox', '-f', String(page), '-l', String(page), pdfPath, '-'], {
    encoding: 'utf8',
  })
  const words = []
  for (const m of xml.matchAll(/<word xMin="(-?[\d.]+)" yMin="(-?[\d.]+)" xMax="(-?[\d.]+)" yMax="(-?[\d.]+)">([^<]*)<\/word>/g)) {
    words.push({ xMin: Number(m[1]), yMin: Number(m[2]), xMax: Number(m[3]), yMax: Number(m[4]), text: m[5] })
  }
  return words
}

function yOf(words, text) {
  const w = words.find((w) => w.text === text)
  if (!w) throw new Error(`no se encontró "${text}" en la hoja -- palabras: ${JSON.stringify(words.map((w) => w.text))}`)
  return w.yMin
}

function countOccurrences(text, needle) {
  return text.split(needle).length - 1
}

// Medido con este mismo fixture (ReportHero con eyebrow "REGIÓN 1",
// sin meta) ANTES de este cambio, con header="afterFirstPage" --
// verificado contra el tag v0.5.2 en un worktree aparte. El pedido
// original medía ~99pt en un informe real (con más contenido en el
// ReportHero); el valor de referencia acá es el de ESTE fixture
// mínimo, para que el test sea autocontenido.
const V052_EYEBROW_Y_AFTER_FIRST_PAGE = 96.535828
// Reducción esperada: 29mm - 17mm = 12mm.
const EXPECTED_REDUCTION_PT = pageMargins.top - pageMargins.firstPageTopNoHeader

for (const orientation of ['portrait', 'landscape']) {
  test(
    `hoja 1, ${orientation}: el eyebrow de ReportHero sube ~12mm (de ~96,5pt a ~62,5pt) con header="afterFirstPage"`,
    { skip: !hasPoppler() && 'poppler-utils no está instalado' },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
      const pdfPath = path.join(dir, 'margin.pdf')
      renderFixture(pdfPath, [orientation, 'afterFirstPage', '2'])

      const y = yOf(bbox(pdfPath, 1), 'REGIÓN')
      const expected = V052_EYEBROW_Y_AFTER_FIRST_PAGE - EXPECTED_REDUCTION_PT
      assert.ok(
        Math.abs(y - expected) <= 1,
        `eyebrow en y=${y}, se esperaba ~${expected.toFixed(2)} (±1pt) -- antes del cambio estaba en ${V052_EYEBROW_Y_AFTER_FIRST_PAGE}`,
      )
    },
  )
}

for (const orientation of ['portrait', 'landscape']) {
  test(
    `hoja 2 en adelante, ${orientation}: el primer contenido queda en la misma posición que en v0.5.2 (29mm, sin regresión)`,
    { skip: !hasPoppler() && 'poppler-utils no está instalado' },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
      const pdfPath = path.join(dir, 'margin.pdf')
      renderFixture(pdfPath, [orientation, 'afterFirstPage', '2'])

      const y = yOf(bbox(pdfPath, 2), 'MARCADOR_HOJA_2')
      assert.ok(
        Math.abs(y - pageMargins.top) <= 0.5,
        `marcador de la hoja 2 en y=${y}, se esperaba ${pageMargins.top.toFixed(2)} (margen de siempre, ±0,5pt)`,
      )
    },
  )
}

for (const orientation of ['portrait', 'landscape']) {
  test(`header="always" (barra en todas las hojas), ${orientation}: la hoja 1 no cambia respecto de v0.5.2`, {
    skip: !hasPoppler() && 'poppler-utils no está instalado',
  }, () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
    const pdfPath = path.join(dir, 'margin.pdf')
    renderFixture(pdfPath, [orientation, 'always', '1'])

    const y = yOf(bbox(pdfPath, 1), 'REGIÓN')
    assert.ok(
      Math.abs(y - V052_EYEBROW_Y_AFTER_FIRST_PAGE) <= 0.5,
      `eyebrow en y=${y} con header="always", debería seguir en ${V052_EYEBROW_Y_AFTER_FIRST_PAGE} (±0,5pt) -- sin cambios`,
    )
  })
}

test(
  'informe de una sola hoja con header="afterFirstPage": el banner arranca a 17mm',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
    const pdfPath = path.join(dir, 'margin-single.pdf')
    renderFixture(pdfPath, ['portrait', 'afterFirstPage', '1'])

    const y = yOf(bbox(pdfPath, 1), 'REGIÓN')
    const expected = V052_EYEBROW_Y_AFTER_FIRST_PAGE - EXPECTED_REDUCTION_PT
    assert.ok(Math.abs(y - expected) <= 1, `eyebrow en y=${y}, se esperaba ~${expected.toFixed(2)} (±1pt)`)
  },
)

test(
  'header="afterFirstPage": la barra sigue sin texto en la hoja 1, y una vez por hoja desde la 2 (no se rompió con el cambio de margen)',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))

    const multiPath = path.join(dir, 'margin-multi.pdf')
    renderFixture(multiPath, ['portrait', 'afterFirstPage', '2'])
    const page1Text = execFileSync('pdftotext', ['-f', '1', '-l', '1', multiPath, '-'], { encoding: 'utf8' })
    const page2Text = execFileSync('pdftotext', ['-f', '2', '-l', '2', multiPath, '-'], { encoding: 'utf8' })
    assert.equal(countOccurrences(page1Text, HEADER_TEXT), 0, 'la barra no debería dejar texto en la hoja 1')
    assert.equal(countOccurrences(page2Text, HEADER_TEXT), 1, 'la barra debería aparecer una vez en la hoja 2')

    const singlePath = path.join(dir, 'margin-single.pdf')
    renderFixture(singlePath, ['portrait', 'afterFirstPage', '1'])
    const singleText = execFileSync('pdftotext', [singlePath, '-'], { encoding: 'utf8' })
    assert.equal(countOccurrences(singleText, HEADER_TEXT), 0, 'un informe de una sola hoja no debería mostrar la barra')
  },
)
