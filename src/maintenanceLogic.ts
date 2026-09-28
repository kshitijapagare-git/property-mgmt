import type { Lease, MaintenanceRequest, MaintenanceStatus } from './types';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Pure eligibility filter for the MaintenanceRequest form's leaseId combobox: only Leases whose
 * status is ACTIVE, per the acceptance criterion that the leaseId Combobox is "sourced only from
 * ACTIVE Leases". Mirrors leaseLogic.ts's getLeasableApplications pattern.
 */
export function getActiveLeaseOptions(leases: Lease[]): Lease[] {
  return leases.filter((l) => l.status === 'ACTIVE');
}

/**
 * The RESOLVED gate: both `resolvedOn` (non-empty) and `cost` (a positive number) must be
 * present for a move to RESOLVED to be considered complete.
 */
export function isResolutionComplete(resolvedOn: string | undefined, cost: number | undefined): boolean {
  return Boolean(resolvedOn && resolvedOn.trim() !== '') && typeof cost === 'number' && cost > 0;
}

export type ApplyStatusChangeResult =
  | { ok: true; request: MaintenanceRequest }
  | { ok: false; message: string };

/**
 * The single function used by both the Kanban board's drag handler and the create/edit form's
 * save path to change a MaintenanceRequest's status, per the technical note that a drag must not
 * be able to skip the RESOLVED requirements. Per clarification, every transition among
 * OPEN/IN_PROGRESS/ON_HOLD/RESOLVED is otherwise unconditionally allowed — only a move to
 * RESOLVED is gated, and only on resolvedOn+cost being present (either already on the request,
 * or supplied via `resolution`). Never mutates the input `request`.
 */
export function applyStatusChange(
  request: MaintenanceRequest,
  nextStatus: MaintenanceStatus,
  resolution?: { resolvedOn: string; cost: number }
): ApplyStatusChangeResult {
  if (nextStatus !== 'RESOLVED') {
    return { ok: true, request: { ...request, status: nextStatus } };
  }

  if (isResolutionComplete(request.resolvedOn, request.cost)) {
    return { ok: true, request: { ...request, status: nextStatus } };
  }

  if (resolution && isResolutionComplete(resolution.resolvedOn, resolution.cost)) {
    return {
      ok: true,
      request: {
        ...request,
        status: nextStatus,
        resolvedOn: resolution.resolvedOn,
        cost: resolution.cost,
      },
    };
  }

  return { ok: false, message: 'Resolving this request requires a resolution date and cost.' };
}

/**
 * True only for an URGENT, not-yet-RESOLVED request whose `reportedOn` is more than 24 hours
 * before `now` (defaulting to the current time) — per clarification, `reportedOn` is an explicit,
 * user-editable field and the highlight is computed from its current value, not creation time.
 */
export function isUrgentOverdue(request: MaintenanceRequest, now: Date = new Date()): boolean {
  if (request.priority !== 'URGENT') return false;
  if (request.status === 'RESOLVED') return false;
  const reportedAt = new Date(request.reportedOn).getTime();
  if (Number.isNaN(reportedAt)) return false;
  return now.getTime() - reportedAt > TWENTY_FOUR_HOURS_MS;
}
