import { describe, it, expect } from 'vitest';
import { getLandlordDeleteBlockMessage } from './landlordDeleteGuard';

describe('getLandlordDeleteBlockMessage', () => {
  it('returns null when no locality references the landlord', () => {
    const localities = [
      { landlordId: 'other-1' },
      { landlordId: 'other-2' },
    ];

    expect(getLandlordDeleteBlockMessage('landlord-1', localities)).toBeNull();
  });

  it('returns null when the localities list is empty', () => {
    expect(getLandlordDeleteBlockMessage('landlord-1', [])).toBeNull();
  });

  it('returns the exact-count message when localities reference the landlord', () => {
    const localities = [
      { landlordId: 'landlord-1' },
      { landlordId: 'landlord-1' },
      { landlordId: 'other' },
    ];

    expect(getLandlordDeleteBlockMessage('landlord-1', localities)).toBe(
      'Cannot delete: landlord has 2 localities.'
    );
  });
});
