import type { ReactNode } from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fontFamily, table, weight } from './tokens.js'

export type DataTableAlign = 'left' | 'center' | 'right'
export type DataTableDensity = 'default' | 'compact'

export type DataTableColumn<T> = {
  key: string
  header: string
  /** Ancho de la columna: número en pt o string en "%". */
  width: number | string
  align?: DataTableAlign
  render: (row: T) => ReactNode
}

const ALIGN_ITEMS: Record<DataTableAlign, 'flex-start' | 'center' | 'flex-end'> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}
const TEXT_ALIGN: Record<DataTableAlign, 'left' | 'center' | 'right'> = {
  left: 'left',
  center: 'center',
  right: 'right',
}

const styles = StyleSheet.create({
  table: { marginBottom: 6 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  headerCell: {
    fontFamily,
    fontWeight: weight.semiBold,
    fontSize: 7.8,
    color: colors.white,
    paddingHorizontal: table.cellGutter,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.borderSoft,
  },
  rowZebra: { backgroundColor: colors.rowZebra },
  cell: { paddingHorizontal: table.cellGutter },
})

/**
 * Tabla genérica del kit: encabezado navy con esquinas redondeadas
 * (repite solo en cada página si la tabla no entra entera, vía el prop
 * `fixed` de @react-pdf/renderer -- ver nota en el header de esta fila),
 * filas con zebra clarito. Cada columna define su propio render de
 * celda, así puede ser una celda de texto simple o cualquiera de las
 * celdas especiales de cells.tsx (distrito, insignias, ranking, etc.).
 *
 * Cada columna tiene un gutter horizontal fijo (`table.cellGutter`)
 * para que el texto de una celda no toque el de la siguiente. `density`
 * (`"compact"` por defecto desde que existe ese gutter) controla el
 * alto de fila -- `"default"` es el alto que tenía el kit antes del
 * gutter, para una tabla puntual que lo necesite más espaciada.
 */
export function DataTable<T>({
  columns,
  rows,
  keyFor,
  density = 'compact',
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  keyFor: (row: T) => string
  density?: DataTableDensity
}) {
  const rowPaddingVertical = table.density[density].rowPaddingVertical

  return (
    <View style={styles.table}>
      {/* `fixed` acá no es "posición absoluta en la página" (como el
          header/footer institucionales) -- dentro de un contenedor que
          sí puede partirse entre páginas, le dice al paginador que este
          hijo se repita en cada página resultante. Así el encabezado de
          la tabla vuelve a aparecer arriba si la lista de filas no
          entra entera en una sola hoja. */}
      <View style={styles.headerRow} fixed>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.headerCell,
              { width: col.width, textAlign: TEXT_ALIGN[col.align ?? 'left'] },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, idx) => (
        <View
          key={keyFor(row)}
          style={[
            styles.row,
            { paddingVertical: rowPaddingVertical },
            idx % 2 === 1 ? styles.rowZebra : undefined,
          ]}
          wrap={false}
        >
          {columns.map((col) => (
            <View
              key={col.key}
              style={[styles.cell, { width: col.width, alignItems: ALIGN_ITEMS[col.align ?? 'left'] }]}
            >
              {col.render(row)}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}
