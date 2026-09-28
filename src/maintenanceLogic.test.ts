import { describe, expect, it } from 'vitest';
import {
  applyStatusChange,
  getActiveLeaseOptions,
  isResolutionComplete,
  isUrgentOverdue,
} from './maintenanceLogic';
import type { Lease, MaintenanceRequest } from './types';

const makeLease = (overrides: Partial<Lease> = {}): Lease => ({
  id: 'lease-1',
  applicationId: 'application-1',
  startDate: '2024-01-01',
  endDate: '2025-01-01',
  monthlyRent: 20000,
  securityDeposit: 40000,
  rentDueDay: 5,
  lockInMonths: 6,
  status: 'ACTIVE',
  ...overrides,
});

const makeRequest = (overrides: Partial<MaintenanceRequest> = {}): MaintenanceRequest => ({
  id: 'maintenance-1',
  leaseId: 'lease-1',
  title: 'Leaking tap',
  category: 'PLUMBING',
  priority: 'MEDIUM',
  description: '<p>desc</p>',
  reportedOn: new Date().toISOString(),
  status: 'OPEN',
  chargeTo: 'OWNER',
  ...overrides,
});

describe('getActiveLeaseOptions', () => {
  it('excludes DRAFT and TERMINATED leases', () => {
    const active = makeLease({ id: 'lease-active', status: 'ACTIVE' });
    const draft = makeLease({ id: 'lease-draft', status: 'DRAFT' });
    const terminated = makeLease({ id: 'lease-terminated', status: 'TERMINATED' });

    const result = getActiveLeaseOptions([active, draft, terminated]);

    expect(result).toContainEqual(active);
    expect(result).toHaveLength(1);
  });
});

describe('isResolutionComplete', () => {
  it('is false when resolvedOn is missing', () => {
    expect(isResolutionComplete(undefined, 100)).toBe(false);
    expect(isResolutionComplete('', 100)).toBe(false);
  });

  it('is false when cost is missing or zero', () => {
    expect(isResolutionComplete('2024-06-01', undefined)).toBe(false);
    expect(isResolutionComplete('2024-06-01', 0)).toBe(false);
  });

  it('is true when both resolvedOn and cost are present', () => {
    expect(isResolutionComplete('2024-06-01', 500)).toBe(true);
  });
});

describe('applyStatusChange', () => {
  it('rejects a move to RESOLVED when neither the request nor a resolution supplies resolvedOn/cost', () => {
    const request = makeRequest({ status: 'IN_PROGRESS', resolvedOn: undefined, cost: undefined });

    const result = applyStatusChange(request, 'RESOLVED');

    expect(result.ok).toBe(false);
  });

  it('accepts a move to RESOLVED when a resolution argument supplies both resolvedOn and cost', () => {
    const request = makeRequest({ status: 'IN_PROGRESS', resolvedOn: undefined, cost: undefined });

    const result = applyStatusChange(request, 'RESOLVED', { resolvedOn: '2024-06-05', cost: 1200 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.request.status).toBe('RESOLVED');
      expect(result.request.resolvedOn).toBe('2024-06-05');
      expect(result.request.cost).toBe(1200);
    }
  });

  it('accepts a move to RESOLVED when the request already carries resolvedOn and cost', () => {
    const request = makeRequest({ status: 'ON_HOLD', resolvedOn: '2024-06-01', cost: 300 });

    const result = applyStatusChange(request, 'RESOLVED');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.request.status).toBe('RESOLVED');
    }
  });

  it('allows every other transition unconditionally, without resolvedOn/cost', () => {
    const openToOnHold = applyStatusChange(makeRequest({ status: 'OPEN' }), 'ON_HOLD');
    const inProgressToOpen = applyStatusChange(makeRequest({ status: 'IN_PROGRESS' }), 'OPEN');
    const onHoldToInProgress = applyStatusChange(makeRequest({ status: 'ON_HOLD' }), 'IN_PROGRESS');

    expect(openToOnHold.ok).toBe(true);
    expect(inProgressToOpen.ok).toBe(true);
    expect(onHoldToInProgress.ok).toBe(true);
  });

  it('never mutates the input request', () => {
    const request = makeRequest({ status: 'OPEN' });
    const original = { ...request };

    applyStatusChange(request, 'ON_HOLD');

    expect(request).toEqual(original);
  });
});

describe('isUrgentOverdue', () => {
  it('is false at exactly 24 hours since reportedOn', () => {
    const now = new Date('2024-06-02T12:00:00Z');
    const reportedOn = new Date('2024-06-01T12:00:00Z').toISOString();
    const request = makeRequest({ priority: 'URGENT', status: 'OPEN', reportedOn });

    expect(isUrgentOverdue(request, now)).toBe(false);
  });

  it('is true beyond 24 hours since reportedOn', () => {
    const now = new Date('2024-06-02T12:00:01Z');
    const reportedOn = new Date('2024-06-01T12:00:00Z').toISOString();
    const request = makeRequest({ priority: 'URGENT', status: 'OPEN', reportedOn });

    expect(isUrgentOverdue(request, now)).toBe(true);
  });

  it('is false once status is RESOLVED, regardless of priority/age', () => {
    const now = new Date('2024-06-10T12:00:00Z');
    const reportedOn = new Date('2024-06-01T12:00:00Z').toISOString();
    const request = makeRequest({ priority: 'URGENT', status: 'RESOLVED', reportedOn, resolvedOn: '2024-06-05', cost: 500 });

    expect(isUrgentOverdue(request, now)).toBe(false);
  });

  it('is false for non-URGENT priorities even when overdue', () => {
    const now = new Date('2024-06-10T12:00:00Z');
    const reportedOn = new Date('2024-06-01T12:00:00Z').toISOString();
    const request = makeRequest({ priority: 'HIGH', status: 'OPEN', reportedOn });

    expect(isUrgentOverdue(request, now)).toBe(false);
  });
});
