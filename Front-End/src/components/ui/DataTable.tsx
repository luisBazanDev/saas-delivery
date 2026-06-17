interface Column<T> {
  key: string
  label: string
  render?: (value: unknown, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
}

export default function DataTable<T extends { id?: number | string; code?: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4"
              >
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || row.code || idx} className="border-b border-dark-border/40 hover:bg-dark-hover/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3.5 px-4 text-sm text-text-secondary">
                  {col.render ? col.render((row as Record<string, unknown>)[col.key], row) : (row as Record<string, unknown>)[col.key] as string}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="py-3.5 px-4">
                  <div className="flex gap-3">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-accent-blue hover:text-accent-blue/80 text-sm transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-accent-red hover:text-accent-red/80 text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
