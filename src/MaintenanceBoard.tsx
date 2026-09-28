import { useState } from 'react';
import type { DragEvent } from 'react';
import MaintenanceResolveGateModal from './MaintenanceResolveGateModal';
import { isResolutionComplete, isUrgentOverdue } from './maintenanceLogic';
import type { MaintenanceRequest, MaintenanceStatus } from './types';

const STATUS_COLUMNS: MaintenanceStatus[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED'];

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  RESOLVED: 'RESOLVED',
};

export interface MaintenanceBoardProps {
  requests: MaintenanceRequest[];
  /**
   * The single point at which a status change is actually committed — the board never mutates
   * `status` itself. When the change resolves the request, `resolution` carries the
   * resolvedOn/cost collected via MaintenanceResolveGateModal so the caller (MaintenanceRequests,
   * which runs maintenanceLogic.applyStatusChange) can commit both the status and those fields
   * together.
   */
  onStatusChange: (id: string, nextStatus: MaintenanceStatus, resolution?: { resolvedOn: string; cost: number }) => void;
  /** Opens the edit form for a card, e.g. on click — optional so the board is usable standalone. */
  onSelect?: (request: MaintenanceRequest) => void;
}

/**
 * Kanban view: one column per MaintenanceStatus. Cards can be dragged between columns (HTML5
 * drag-and-drop) or, per the technical note's keyboard-alternative requirement, moved via a
 * per-card <select> — both paths funnel through `attemptStatusChange` so a drag can never skip
 * the RESOLVED gate the form also enforces. When a move targets RESOLVED and the request doesn't
 * already have both resolvedOn and cost, the move is held (`pendingResolveRequest`) and
 * MaintenanceResolveGateModal is shown; only its submit actually calls `onStatusChange`.
 */
export default function MaintenanceBoard({ requests, onStatusChange, onSelect }: MaintenanceBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pendingResolveRequest, setPendingResolveRequest] = useState<MaintenanceRequest | null>(null);

  const attemptStatusChange = (request: MaintenanceRequest, nextStatus: MaintenanceStatus) => {
    if (nextStatus === request.status) return;
    if (nextStatus === 'RESOLVED' && !isResolutionComplete(request.resolvedOn, request.cost)) {
      setPendingResolveRequest(request);
      return;
    }
    onStatusChange(request.id, nextStatus);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStatus: MaintenanceStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    setDraggingId(null);
    if (!id) return;
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    attemptStatusChange(request, targetStatus);
  };

  const handleStatusSelect = (request: MaintenanceRequest, nextStatus: MaintenanceStatus) => {
    attemptStatusChange(request, nextStatus);
  };

  const handleResolveSubmit = (resolvedOn: string, cost: number) => {
    if (!pendingResolveRequest) return;
    onStatusChange(pendingResolveRequest.id, 'RESOLVED', { resolvedOn, cost });
    setPendingResolveRequest(null);
  };

  const handleResolveCancel = () => setPendingResolveRequest(null);

  return (
    <div className="maintenance-board">
      {STATUS_COLUMNS.map((status) => {
        const cardsInColumn = requests.filter((r) => r.status === status);
        return (
          <div
            key={status}
            className="maintenance-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="maintenance-column-header">
              {STATUS_LABELS[status]} <span className="maintenance-column-count">{cardsInColumn.length}</span>
            </div>
            <div className="maintenance-column-cards">
              {cardsInColumn.length === 0 ? (
                <div className="maintenance-column-empty">No requests</div>
              ) : (
                cardsInColumn.map((request) => {
                  const overdue = isUrgentOverdue(request);
                  return (
                    <div
                      key={request.id}
                      className={`maintenance-card ${overdue ? 'maintenance-card-overdue' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, request.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelect?.(request)}
                      title={overdue ? 'URGENT overdue' : undefined}
                    >
                      <div className="maintenance-card-title">{request.title}</div>
                      <div className="maintenance-card-meta">
                        {request.category} • {request.priority}
                      </div>
                      {overdue && (
                        <div className="maintenance-card-badge">URGENT overdue</div>
                      )}
                      <label className="maintenance-card-status-control">
                        <span>Status</span>
                        <select
                          value={request.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusSelect(request, e.target.value as MaintenanceStatus);
                          }}
                        >
                          {STATUS_COLUMNS.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {pendingResolveRequest && (
        <MaintenanceResolveGateModal
          onSubmit={handleResolveSubmit}
          onCancel={handleResolveCancel}
        />
      )}
    </div>
  );
}
