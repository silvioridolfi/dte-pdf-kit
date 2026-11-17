import type { ReactNode } from 'react'
import { Text as PdfText, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import { fontFamily } from './tokens.js'

type TextStyle = Style | Style[]

/**
 * `Text` del kit: fija `fontFamily` siempre, nunca lo deja a cargo de
 * la herencia. Si el contenido es un string con saltos de línea
 * (`\n`), lo parte ACÁ, línea por línea, y arma cada línea como su
 * propio nodo de texto en un `<View>` (layout de bloque, una fila por
 * línea) -- nunca como un `\n` literal adentro de un mismo nodo de
 * `<Text>`, que es donde @react-pdf/renderer puede re-resolver la
 * fuente de la línea nueva sin heredarla del padre y caer a Helvetica.
 *
 * Para contenido que no es un string plano con `\n` (ej. texto
 * compuesto con otro `<Text>` anidado para una palabra en negrita) se
 * usa tal cual, con `fontFamily` igual fijado en el nodo exterior.
 *
 * Alias: `MultilineText` -- mismo componente, nombre más explícito
 * para cuando el contenido es justo un párrafo con saltos de línea.
 */
export function Text({ children, style }: { children: ReactNode; style?: TextStyle }) {
  if (typeof children === 'string' && children.includes('\n')) {
    return (
      <View>
        {children.split('\n').map((line, i) => (
          <PdfText key={i} style={[{ fontFamily }, style]}>
            {line || ' '}
          </PdfText>
        ))}
      </View>
    )
  }

  return <PdfText style={[{ fontFamily }, style]}>{children}</PdfText>
}

export const MultilineText = Text
