import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from './Modal';

export interface MaintenanceResolveGateModalProps {
  onSubmit: (resolvedOn: string, cost: number) => void;
  onCancel: () => void;
}

/**
 * The RESOLVED gate: shown when a move to RESOLVED is attempted (via drag or the keyboard
 * status <select> on MaintenanceBoard) on a MaintenanceRequest that doesn't yet have both
 * resolvedOn and cost. Only submitting this modal actually completes the move — cancelling
 * leaves the request's status untouched, per maintenanceLogic.applyStatusChange's contract.
 */
export default function MaintenanceResolveGateModal({ onSubmit, onCancel }: MaintenanceResolveGateModalProps) {
  const [resolvedOn, setResolvedOn] = useState('');
  const [cost, setCost] = useState(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(resolvedOn, cost);
  };

  return (
    <Modal
      title="Resolve maintenance request"
      submitLabel="Mark resolved"
      onClose={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label htmlFor="resolvedOn">Resolved on</label>
        <input
          id="resolvedOn"
          name="resolvedOn"
          type="date"
          value={resolvedOn}
          onChange={(e) => setResolvedOn(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="cost">Cost</label>
        <input
          id="cost"
          name="cost"
          type="number"
          min={0}
          step="1"
          value={cost === 0 ? '' : cost}
          onChange={(e) => setCost(e.target.value === '' ? 0 : Number(e.target.value))}
          required
        />
      </div>
    </Modal>
  );
}
