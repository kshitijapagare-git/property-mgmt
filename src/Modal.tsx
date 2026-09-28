import type { FormEventHandler, ReactNode } from 'react';

interface ModalProps {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  /** When true, the form's controls are disabled and only a Close action is shown — used for
   * read-only "view" screens that reuse this Modal instead of a bespoke detail view. */
  readOnly?: boolean;
}

export default function Modal({ title, submitLabel, onClose, onSubmit, children, readOnly = false }: ModalProps) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <fieldset disabled={readOnly} className="modal-fieldset">
            {children}
          </fieldset>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button type="submit" className="btn btn-primary">{submitLabel}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
