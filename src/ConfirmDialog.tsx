import type { ReactNode } from 'react';

export interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A reusable blocking confirmation dialog, built on the existing overlay/modal styling, whose
 * confirm action can be disabled with an arbitrary message — used by delete guards (Landlord's
 * "has localities" guard, and later tickets' delete guards) instead of a bespoke alert().
 */
export default function ConfirmDialog({
  title,
  message,
  confirmDisabled = false,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close" onClick={onCancel}>×</button>
        </div>
        <div className="confirm-dialog-message">{message}</div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={confirmDisabled}
            onClick={() => {
              if (!confirmDisabled) onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
