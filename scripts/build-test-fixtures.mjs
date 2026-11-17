// Bundlea cada fixture .tsx de tests/fixtures/ a un .mjs ejecutable
// con `node` directo. Hace falta porque node --test no trae loader de
// TSX/JSX, y tsx no puede cargar @react-pdf/renderer (ver README /
// notas de la sesión: ERR_PACKAGE_PATH_NOT_EXPORTED en
// @react-pdf/hyphenate). Solo se usa para tests del kit, nunca en el
// build que consumen las apps.
import { build } from 'esbuild'
import { readdirSync } from 'node:fs'
import path from 'node:path'

const fixturesDir = path.join(import.meta.dirname, '..', 'tests', 'fixtures')
const entryPoints = readdirSync(fixturesDir)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => path.join(fixturesDir, f))

if (entryPoints.length === 0) {
  process.exit(0)
}

await build({
  entryPoints,
  outdir: fixturesDir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  jsx: 'automatic',
  external: ['@react-pdf/renderer', 'react'],
  logLevel: 'info',
})
