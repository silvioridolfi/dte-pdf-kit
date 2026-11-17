// Test del punto "I" del pedido: con header="afterFirstPage", la
// banda fina del header no puede dejar texto extraíble en la página 1
// (antes la tapaba con un rectángulo blanco -- el texto seguía ahí).
// Requiere poppler-utils instalado (pdftotext, pdfinfo) -- se salta
// con un aviso si no está, no rompe `npm test` en una máquina sin
// poppler.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const HEADER_TEXT = 'Dirección de Tecnología Educativa'

function hasPoppler() {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function pageCount(pdfPath) {
  const out = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' })
  return Number(out.match(/^Pages:\s+(\d+)/m)[1])
}

function pageText(pdfPath, pageNumber) {
  return execFileSync('pdftotext', ['-f', String(pageNumber), '-l', String(pageNumber), pdfPath, '-'], {
    encoding: 'utf8',
  })
}

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1
}

function renderFixture(outPath, pages) {
  execFileSync(
    'node',
    [path.join(import.meta.dirname, 'fixtures', 'continuation-header.mjs'), outPath, String(pages)],
    { stdio: 'inherit' },
  )
}

test('header="afterFirstPage": sin texto en la página 1, una vez por hoja desde la 2', { skip: !hasPoppler() && 'poppler-utils no está instalado' }, () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
  const pdfPath = path.join(dir, 'multi.pdf')
  renderFixture(pdfPath, 3)

  const pages = pageCount(pdfPath)
  assert.ok(pages >= 2, `se esperaban al menos 2 hojas, hubo ${pages}`)

  const page1Text = pageText(pdfPath, 1)
  assert.equal(
    countOccurrences(page1Text, HEADER_TEXT),
    0,
    'el texto de la barra fina no debería aparecer en la hoja 1',
  )

  for (let p = 2; p <= pages; p++) {
    const text = pageText(pdfPath, p)
    assert.equal(
      countOccurrences(text, HEADER_TEXT),
      1,
      `la barra fina debería aparecer exactamente una vez en la hoja ${p}`,
    )
  }
})

test('header="afterFirstPage": informe de una sola hoja no muestra la barra en absoluto', { skip: !hasPoppler() && 'poppler-utils no está instalado' }, () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
  const pdfPath = path.join(dir, 'single.pdf')
  renderFixture(pdfPath, 1)

  assert.equal(pageCount(pdfPath), 1)
  const text = pageText(pdfPath, 1)
  assert.equal(countOccurrences(text, HEADER_TEXT), 0)
})
