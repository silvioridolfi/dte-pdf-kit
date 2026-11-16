// Genera src/generated-assets.ts a partir de los binarios en assets/,
// como data: URLs en base64. Corre automático como parte de `npm run
// build` (y de `prepare`, así que también corre solo al instalar el
// paquete vía git). No tocar src/generated-assets.ts a mano -- editar
// el binario correspondiente en assets/ y volver a correr esto.
//
// Por qué base64 y no una ruta de archivo: @react-pdf/renderer (via
// fontkit/@react-pdf/image) sabe resolver tanto una ruta de archivo
// local como una data: URL para Font.register/<Image src>. Una ruta de
// archivo depende de que el bundler de quien consume el paquete (ej.
// Next.js en Vercel) detecte y empaquete ese archivo en la función
// serverless -- con un paquete externo cargado por ruta dinámica, ese
// tracing puede fallar en silencio. Una data: URL viaja embebida en el
// JS compilado, sin ninguna dependencia de archivos en runtime.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function toDataUrl(relPath, mime) {
  const buf = readFileSync(path.join(root, relPath))
  return `data:${mime};base64,${buf.toString('base64')}`
}

const FONT_WEIGHT_FILES = [
  ['LIGHT', 'EncodeSans-Light.ttf'],
  ['REGULAR', 'EncodeSans-Regular.ttf'],
  ['MEDIUM', 'EncodeSans-Medium.ttf'],
  ['SEMI_BOLD', 'EncodeSans-SemiBold.ttf'],
  ['BOLD', 'EncodeSans-Bold.ttf'],
  ['EXTRA_BOLD', 'EncodeSans-ExtraBold.ttf'],
]

const lines = [
  '// Generado por scripts/build-assets.mjs a partir de assets/ -- NO EDITAR A MANO.',
  '// Para cambiar una fuente o el logo: reemplazar el binario en assets/ y correr',
  '// `npm run build` (o `npm run build:assets`) de nuevo.',
  '',
]

// Anotamos ": string" en cada const -- si no, TypeScript infiere el tipo
// como el string literal completo (el base64 entero adentro del tipo),
// y el .d.ts generado termina pesando lo mismo que los binarios.
for (const [name, file] of FONT_WEIGHT_FILES) {
  lines.push(`export const ENCODE_SANS_${name}_DATA_URL: string = '${toDataUrl(`assets/fonts/${file}`, 'font/ttf')}'`)
}

lines.push(`export const FOOTER_LOGO_DATA_URL: string = '${toDataUrl('assets/footer-pba.png', 'image/png')}'`)
lines.push('')

writeFileSync(path.join(root, 'src/generated-assets.ts'), lines.join('\n'))
console.log('OK -- src/generated-assets.ts generado desde assets/.')
