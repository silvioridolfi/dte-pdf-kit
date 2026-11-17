// Test del punto "D" del pedido (corregido por la decisión #4): dos
// semánticas de saneamiento de números, una para los componentes
// existentes (negativos se conservan) y otra para los gráficos
// nuevos (negativos también pasan a 0).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toSafeNumber, toSafeChartNumber } from '../dist/index.js'

test('toSafeNumber conserva negativos válidos', () => {
  assert.equal(toSafeNumber(-3), -3)
  assert.equal(toSafeNumber(3), 3)
  assert.equal(toSafeNumber(0), 0)
})

test('toSafeNumber pasa a 0 los valores inválidos', () => {
  assert.equal(toSafeNumber(NaN), 0)
  assert.equal(toSafeNumber(Infinity), 0)
  assert.equal(toSafeNumber(-Infinity), 0)
  assert.equal(toSafeNumber(null), 0)
  assert.equal(toSafeNumber(undefined), 0)
  assert.equal(toSafeNumber('3'), 0)
})

test('toSafeChartNumber además recorta negativos a 0', () => {
  assert.equal(toSafeChartNumber(-3), 0)
  assert.equal(toSafeChartNumber(3), 3)
  assert.equal(toSafeChartNumber(NaN), 0)
  assert.equal(toSafeChartNumber(Infinity), 0)
  assert.equal(toSafeChartNumber(-Infinity), 0)
  assert.equal(toSafeChartNumber(null), 0)
  assert.equal(toSafeChartNumber(undefined), 0)
})
