// Test del punto "J" del pedido: contraste WCAG de los tokens de
// texto contra sus fondos reales. Falla si text/textSecondary/
// textMuted/distritoText bajan de 4,5:1, o si neutral baja de 3:1
// sobre blanco (es un color de relleno de gráfico, no de texto).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { colors, contrastRatio } from '../dist/index.js'

const WHITE = '#FFFFFF'

test('text cumple 4,5:1 sobre blanco', () => {
  assert.ok(contrastRatio(colors.text, WHITE) >= 4.5)
})

test('textSecondary cumple 4,5:1 sobre blanco y cardBg', () => {
  assert.ok(contrastRatio(colors.textSecondary, WHITE) >= 4.5)
  assert.ok(contrastRatio(colors.textSecondary, colors.cardBg) >= 4.5)
})

test('textMuted cumple 4,5:1 sobre blanco y cardBg', () => {
  assert.ok(contrastRatio(colors.textMuted, WHITE) >= 4.5)
  assert.ok(contrastRatio(colors.textMuted, colors.cardBg) >= 4.5)
})

test('distritoText cumple 4,5:1 sobre blanco, cardBg y distritoBg', () => {
  assert.ok(contrastRatio(colors.distritoText, WHITE) >= 4.5)
  assert.ok(contrastRatio(colors.distritoText, colors.cardBg) >= 4.5)
  assert.ok(contrastRatio(colors.distritoText, colors.distritoBg) >= 4.5)
})

test('neutral (relleno de gráfico, no texto) cumple 3:1 sobre blanco', () => {
  assert.ok(contrastRatio(colors.neutral, WHITE) >= 3)
})
