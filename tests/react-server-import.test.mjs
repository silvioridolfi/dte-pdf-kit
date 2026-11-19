// Bug real al usar el kit en bitacora-pp: dte-pdf-kit v0.5.0 a v0.5.3
// crasheaba (o directamente no importaba) apenas se importaba
// CUALQUIER COSA del paquete, aunque el reporte no usara ningún
// gráfico (StackedBar/ColumnChart/ChartCard) -- `chart-common.ts`
// creaba su Context de React con un `import { createContext,
// useContext } from 'react'` a nivel de módulo (`export const
// ChartCardWidthContext = createContext(null)`), y esos dos nombres
// no existen en el build de React para la condición de resolución
// "react-server" -- la que usan los Route Handlers de Next.js (y
// cualquier entorno de solo Server Components) -- confirmado
// inspeccionando react.react-server.development.js, que no las
// exporta. Según el bundler, esto rompe en el import mismo (el
// loader nativo de Node, estricto) o recién al llamarlas (Turbopack/
// webpack, laxos) -- pero bitacora-pp lo pisó en producción como lo
// segundo: "(0, B.createContext) is not a function" apenas se
// importaba el paquete desde una ruta API.
//
// Node soporta simular la condición real con `--conditions=react-
// server` (selecciona la misma rama del "exports" map de react/
// package.json que usa Next.js) -- mucho más fiel que mockear
// 'react' a mano, y además más estricto: si esto pasa acá, pasa
// también bajo la interop más laxa de los bundlers.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

test('importar el paquete entero no rompe bajo la condición de resolución "react-server" de react', () => {
  const indexPath = path.join(import.meta.dirname, '..', 'dist', 'index.js')
  const script = `
    import('${indexPath}')
      .then((kit) => {
        if (typeof kit.StackedBar !== 'function') throw new Error('StackedBar no se importó bien')
        if (typeof kit.ChartCard !== 'function') throw new Error('ChartCard no se importó bien')
        console.log('OK')
      })
      .catch((e) => {
        console.error(e.message)
        process.exit(1)
      })
  `
  const out = execFileSync('node', ['--conditions=react-server', '-e', script], { encoding: 'utf8' })
  assert.match(out, /OK/)
})
