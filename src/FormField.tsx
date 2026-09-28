import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}

/**
 * Wraps a label + control + inline validation error so every CRUD form renders fields
 * consistently instead of hand-rolling <div className="field"> blocks.
 */
export default function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
