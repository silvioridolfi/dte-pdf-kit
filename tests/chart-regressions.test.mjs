// Regresiones reportadas al usar v0.5.0 en la agenda. Cada bloque
// tiene su propio test, que falla antes de la corrección
// correspondiente y pasa después.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chartCard } from '../dist/index.js'
import { LABEL_BAR_GAP } from '../dist/BarChart.js'

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

function pageText(pdfPath) {
  return execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8' })
}

// pdftotext pone cada número solo en su propia "línea" -- cuenta
// tokens que son EXACTAMENTE "0", nunca una subcadena de "10" o "30".
function countStandaloneZero(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l === '0').length
}

function bboxWords(pdfPath) {
  const xml = execFileSync('pdftotext', ['-bbox', pdfPath, '-'], { encoding: 'utf8' })
  const words = []
  for (const m of xml.matchAll(/<word xMin="(-?[\d.]+)" yMin="(-?[\d.]+)" xMax="(-?[\d.]+)" yMax="(-?[\d.]+)">([^<]*)<\/word>/g)) {
    words.push({ xMin: Number(m[1]), yMin: Number(m[2]), xMax: Number(m[3]), text: m[5] })
  }
  return words
}

// --- Bug 1: ColumnChart dibuja "0" encima de columnas/series vacías ---

test(
  'ColumnChart stacked: una columna con total 0 no muestra el número "0" encima',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
    const pdfPath = path.join(dir, 'zero-stacked.pdf')
    renderFixture('column-chart-zero', pdfPath, ['stacked'])
    const text = pageText(pdfPath)
    // Con ticks=1 el único "0" legítimo en la página es el del eje Y
    // (tick 0) -- cualquier otro "0" es el bug dibujando el valor de
    // la columna vacía.
    assert.equal(countStandaloneZero(text), 1, `se esperaba un solo "0" (el del eje), texto:\n${text}`)
  },
)

test(
  'ColumnChart overlay: una serie en 0 no muestra el número "0" encima, aunque otra serie de la misma columna sea > 0',
  { skip: !hasPoppler() && 'poppler-utils no está instalado' },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
    const pdfPath = path.join(dir, 'zero-overlay.pdf')
    renderFixture('column-chart-zero', pdfPath, ['overlay'])
    const text = pageText(pdfPath)
    assert.equal(countStandaloneZero(text), 1, `se esperaba un solo "0" (el del eje), texto:\n${text}`)
  },
)

// --- Bug 2: con valores enteros, el eje Y no debe mostrar pasos fraccionarios ---

for (const maxValue of [1, 2, 3, 7, 11]) {
  test(
    `ColumnChart con valores enteros y máximo ${maxValue}: el eje Y es todo enteros`,
    { skip: !hasPoppler() && 'poppler-utils no está instalado' },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
      const pdfPath = path.join(dir, `axis-${maxValue}.pdf`)
      renderFixture('column-chart-integer-axis', pdfPath, [String(maxValue)])
      const text = pageText(pdfPath)
      assert.doesNotMatch(
        text,
        /\d,\d/,
        `el eje muestra un paso fraccionario con máximo ${maxValue}, texto:\n${text}`,
      )
    },
  )
}

// --- Bug 3 (v0.5.1): en HorizontalBarChart, el rótulo truncado toca la barra ---

// labelWidth angosto a propósito: "Profesionalizantes" sola (~64pt a
// 8pt) no entra en 50pt -- es el caso que reproducía el bug (una
// palabra que no entra ni sola en la línea quedaba sin truncar, sin
// "…", en vez de cortarse).
const NARROW_LABEL_WIDTH = 50

for (const labelLines of [1, 2]) {
  for (const size of ['full', 'half']) {
    for (const inCard of [false, true]) {
      const desc = `labelLines=${labelLines} size=${size} ${inCard ? 'adentro' : 'afuera'} de ChartCard`
      test(
        `HorizontalBarChart: el rótulo truncado no toca la barra (${desc})`,
        { skip: !hasPoppler() && 'poppler-utils no está instalado' },
        () => {
          const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
          const pdfPath = path.join(dir, 'label-gap.pdf')
          renderFixture('horizontal-bar-label-gap', pdfPath, [
            String(labelLines),
            size,
            inCard ? 'card' : 'no-card',
            String(NARROW_LABEL_WIDTH),
          ])

          const contentBoxX = inCard ? chartCard.borderWidth + chartCard.padding : 0
          const labelWidth = NARROW_LABEL_WIDTH
          const barStartX = contentBoxX + labelWidth

          const words = bboxWords(pdfPath)
          // Palabras del rótulo: están a la izquierda del inicio de la
          // barra y no son el valor ("42") ni el título de la tarjeta.
          const labelWords = words.filter(
            (w) => w.xMin < barStartX - 1 && /[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(w.text) && w.text !== 'Tarjeta',
          )
          assert.ok(labelWords.length > 0, `no se encontró texto del rótulo (${desc})`)
          for (const w of labelWords) {
            assert.ok(
              w.xMax < barStartX,
              `el rótulo "${w.text}" toca o pasa la barra: xMax=${w.xMax}, inicio de barra=${barStartX} (${desc})`,
            )
          }
        },
      )
    }
  }
}

// --- Bug 4 (v0.5.2): el corte truncaba contra labelWidth a secas, sin
// restar el hueco hasta la barra -- a diferencia del test de arriba
// (que solo pedía "no tocar" la barra), acá se exige el margen
// COMPLETO de LABEL_BAR_GAP, con el ancho de columna real del bug
// reportado (143pt) y un labelWidth que de verdad obliga a truncar
// "Prácticas Profesionalizantes" (90pt, menor a su ancho completo). ---

const TRUNCATING_LABEL_WIDTH = 90

for (const labelLines of [1, 2]) {
  for (const size of ['full', 'half']) {
    for (const inCard of [false, true]) {
      for (const orientation of ['portrait', 'landscape']) {
        const desc = `labelLines=${labelLines} size=${size} ${inCard ? 'adentro' : 'afuera'} de ChartCard, ${orientation}`
        test(
          `HorizontalBarChart: el rótulo truncado deja el hueco completo de LABEL_BAR_GAP antes de la barra (${desc})`,
          { skip: !hasPoppler() && 'poppler-utils no está instalado' },
          () => {
            const dir = mkdtempSync(path.join(tmpdir(), 'dte-pdf-kit-test-'))
            const pdfPath = path.join(dir, 'label-gap-strict.pdf')
            renderFixture('horizontal-bar-label-gap', pdfPath, [
              String(labelLines),
              size,
              inCard ? 'card' : 'no-card',
              String(TRUNCATING_LABEL_WIDTH),
              orientation,
            ])

            const contentBoxX = inCard ? chartCard.borderWidth + chartCard.padding : 0
            const barStartX = contentBoxX + TRUNCATING_LABEL_WIDTH

            const words = bboxWords(pdfPath)
            const labelWords = words.filter(
              (w) => w.xMin < barStartX - 1 && /[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(w.text) && w.text !== 'Tarjeta',
            )
            assert.ok(labelWords.length > 0, `no se encontró texto del rótulo (${desc})`)

            // El rótulo tiene que haberse cortado (no entra entero en
            // 90pt) y, sobre todo, dejar el hueco de LABEL_BAR_GAP
            // completo antes de donde arranca la barra -- pdftotext
            // devuelve la caja del texto YA truncado, así que acá sí
            // se ve el bug (a diferencia de extraer el texto plano).
            const maxXMax = Math.max(...labelWords.map((w) => w.xMax))
            assert.ok(
              maxXMax <= barStartX - LABEL_BAR_GAP + 0.5, // +0.5 de tolerancia de redondeo
              `el rótulo llega a xMax=${maxXMax}, debería dejar el hueco completo antes de ${barStartX} (gap=${LABEL_BAR_GAP}) (${desc})`,
            )
          },
        )
      }
    }
  }
}
