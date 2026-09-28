import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

/**
 * Generic table primitive centralizing the loading/empty/error states so every CRUD list
 * (Landlord, Locality, and later tickets) renders them the same way instead of each page
 * hand-rolling its own <table>. Visual markup/classes match what Landlords/Localities/Property
 * already used, so styling is unchanged for existing screens migrating onto this component.
 */
export default function DataTable<T extends { id: string }>({
  rows,
  columns,
  loading = false,
  error,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        {error ? (
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <div className="table-error" role="alert">{error}</div>
              </td>
            </tr>
          </tbody>
        ) : loading ? (
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <div className="spinner" role="status" aria-live="polite">Loading…</div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="empty">{emptyMessage}</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>
    </div>
  );
}
