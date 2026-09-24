import type { ReactNode } from 'react';
import type { Column } from './types';

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage: string;
  renderActions?: (row: T) => ReactNode;
}

export default function DataTable<T extends object>({
  columns,
  rows,
  rowKey,
  emptyMessage,
  renderActions,
}: DataTableProps<T>) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {renderActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  // A column without `render` reads the field named by `key` straight off the
                  // row, exactly as before. `key` is a plain string (see Column in types.ts),
                  // so the lookup needs the cast; the value is a rendered field either way.
                  <td key={col.key}>{col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}</td>
                ))}
                {renderActions && <td>{renderActions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
