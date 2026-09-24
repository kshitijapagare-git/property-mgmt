import { describe, it, expect } from 'vitest';
import { validateDateRange } from './dateRangeGuard';

describe('validateDateRange', () => {
  it('returns null for a valid range where to is after from', () => {
    expect(validateDateRange('2024-01-01', '2024-01-31')).toBeNull();
  });

  it('returns null when to and from are equal', () => {
    expect(validateDateRange('2024-01-01', '2024-01-01')).toBeNull();
  });

  it('returns an error message when to is before from', () => {
    expect(validateDateRange('2024-02-01', '2024-01-01')).toBe(
      'Available to cannot be before available from.'
    );
  });

  it('returns null when either bound is not yet set', () => {
    expect(validateDateRange('', '2024-01-01')).toBeNull();
    expect(validateDateRange('2024-01-01', '')).toBeNull();
  });
});
