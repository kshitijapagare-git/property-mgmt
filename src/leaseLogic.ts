import type { Application, Lease, LeaseStatus, Listing, Viewing } from './types';

/**
 * Pure eligibility filter for the Lease form's applicationId combobox: only Applications whose
 * status is APPROVED and which are not already referenced by any existing Lease's applicationId.
 * Mirrors Applications.tsx's exported getConfirmedViewings pattern. Callers that need to keep
 * the currently-edited lease's own application selectable while editing should union this
 * result with that one application themselves (see Leases.tsx).
 */
export function getLeasableApplications(applications: Application[], leases: Lease[]): Application[] {
  const leasedApplicationIds = new Set(leases.map((l) => l.applicationId));
  return applications.filter((a) => a.status === 'APPROVED' && !leasedApplicationIds.has(a.id));
}

/**
 * Resolves the Listing linked to a Lease's Application by walking
 * Application.viewingId -> Viewing.listingId — per the technical note, the Listing is always
 * derived this way rather than exposed as a second selector on the Lease form.
 */
export function listingIdForApplication(
  applicationId: string,
  applications: Application[],
  viewings: Viewing[]
): string | undefined {
  const application = applications.find((a) => a.id === applicationId);
  if (!application) return undefined;
  const viewing = viewings.find((v) => v.id === application.viewingId);
  return viewing?.listingId;
}

/**
 * One-time prefill for a brand-new Lease: reads the linked Application's current offeredRent
 * and moveInDate. Callers must invoke this only once, on selection while creating — never on
 * every render, and never when editing an already-saved Lease, mirroring
 * applicationDefaults.ts's defaultOfferedRentForListing contract.
 */
export function defaultsFromApplication(application: Application): { monthlyRent: number; startDate: string } {
  return { monthlyRent: application.offeredRent, startDate: application.moveInDate };
}

/** Pure default: securityDeposit defaults to 2 × monthlyRent, but stays freely editable afterwards. */
export function defaultSecurityDeposit(monthlyRent: number): number {
  return 2 * monthlyRent;
}

const daysInMonth = (year: number, monthIndex: number): number => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

/**
 * Month arithmetic with day-of-month clamping to the last valid day of the target month, per
 * clarification: 2024-01-31 + 1 month => 2024-02-29 (leap year), 2023-01-31 + 1 month =>
 * 2023-02-28, 2024-03-31 + 1 month => 2024-04-30. Operates on plain "YYYY-MM-DD" strings using
 * UTC dates throughout, so no timezone conversion is applied.
 */
export function addMonthsClamped(dateISO: string, months: number): string {
  const [yearStr, monthStr, dayStr] = dateISO.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);

  const totalMonths = year * 12 + monthIndex + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12;
  const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonthIndex));

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${targetYear}-${pad(targetMonthIndex + 1)}-${pad(clampedDay)}`;
}

/** The earliest endDate that satisfies the lock-in requirement, given startDate and lockInMonths. */
export function minEndDate(startDate: string, lockInMonths: number): string {
  return addMonthsClamped(startDate, lockInMonths);
}

/** Whether endDate is on or after startDate + lockInMonths (clamped). */
export function isLockInSatisfied(startDate: string, endDate: string, lockInMonths: number): boolean {
  return endDate >= minEndDate(startDate, lockInMonths);
}

/**
 * One-ACTIVE-lease-per-Listing rule check: true only when some other Lease (excluding
 * `excludeLeaseId`, so a lease being edited never conflicts with itself) is ACTIVE and resolves
 * to the same listingId.
 */
export function hasActiveLeaseForListing(
  leases: Lease[],
  listingId: string,
  excludeLeaseId?: string,
  applications?: Application[],
  viewings?: Viewing[]
): boolean {
  return leases.some((l) => {
    if (l.id === excludeLeaseId) return false;
    if (l.status !== 'ACTIVE') return false;
    if (!applications || !viewings) return false;
    return listingIdForApplication(l.applicationId, applications, viewings) === listingId;
  });
}

export type ApplyActivationResult =
  | { ok: true; lease: Lease; listings: Listing[] }
  | { ok: false; message: string };

/**
 * New (not reused, since no generic Listing status-update utility exists in the repo) analogue
 * of Applications.tsx's applyApproval for the ACTIVE-Lease -> Listing LET transition. Given a
 * lease being saved with status ACTIVE, the resolved listingId, the current leases (excluding
 * this lease's own prior state, matched by lease.id) and listings, returns either a newly-built
 * listings array with only that Listing flipped to LET (every other listing untouched, same
 * object reference) or a conflict message when another ACTIVE lease already exists for that
 * Listing. Never mutates the input `listings` or `leases` arrays.
 */
export function applyActivation(
  lease: Lease,
  leases: Lease[],
  listings: Listing[],
  listingId: string | undefined,
  applications: Application[],
  viewings: Viewing[]
): ApplyActivationResult {
  if (!listingId) {
    return { lease, listings, ok: true };
  }

  const conflict = hasActiveLeaseForListing(leases, listingId, lease.id, applications, viewings);
  if (conflict) {
    return { ok: false, message: 'Another lease is already ACTIVE for this listing.' };
  }

  const updatedListings = listings.map((l) => (l.id === listingId ? { ...l, status: 'LET' as const } : l));
  return { ok: true, lease, listings: updatedListings };
}

/**
 * Inline validation for terminating a Lease: only applies when `status` is TERMINATED. Requires
 * both terminationDate and terminationReason to be present, and terminationDate to fall within
 * [startDate, endDate] inclusive.
 */
export function validateTermination(
  status: LeaseStatus,
  terminationDate: string | undefined,
  terminationReason: string | undefined,
  startDate: string,
  endDate: string
): string | undefined {
  if (status !== 'TERMINATED') return undefined;
  if (!terminationDate) return 'Termination date is required.';
  if (!terminationReason || !terminationReason.trim()) return 'Termination reason is required.';
  if (terminationDate < startDate || terminationDate > endDate) {
    return 'Termination date must fall within the lease term.';
  }
  return undefined;
}
