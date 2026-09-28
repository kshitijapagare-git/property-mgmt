import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import Listings, { isWithinAvailabilityRange } from './Listings';
import type { Listing, Property, PropertyType } from './types';

const properties: Property[] = [
  { id: 'prop-1', name: 'Sunrise Apartments', localityId: 'loc-1', propertyTypeId: 'pt-1' },
  { id: 'prop-2', name: 'Palm Residency', localityId: 'loc-1', propertyTypeId: 'pt-2' },
];

const propertyTypes: PropertyType[] = [
  { id: 'pt-1', name: 'Apartment' },
  { id: 'pt-2', name: 'Villa' },
];

function makeListing(overrides: Partial<Listing>): Listing {
  return {
    id: overrides.id ?? 'listing-default',
    propertyId: 'prop-1',
    expectedRent: 20000,
    availableFrom: '2024-06-01',
    availableTo: '2024-12-01',
    description: 'A cozy home',
    amenities: [],
    status: 'LIVE',
    ...overrides,
  };
}

describe('isWithinAvailabilityRange', () => {
  it('matches a date within the range, including both boundaries', () => {
    expect(isWithinAvailabilityRange('2024-06-05', { start: '2024-06-01', end: '2024-06-10' })).toBe(true);
    expect(isWithinAvailabilityRange('2024-06-01', { start: '2024-06-01', end: '2024-06-10' })).toBe(true);
    expect(isWithinAvailabilityRange('2024-06-10', { start: '2024-06-01', end: '2024-06-10' })).toBe(true);
  });

  it('excludes a date outside either boundary', () => {
    expect(isWithinAvailabilityRange('2024-05-31', { start: '2024-06-01', end: '2024-06-10' })).toBe(false);
    expect(isWithinAvailabilityRange('2024-06-11', { start: '2024-06-01', end: '2024-06-10' })).toBe(false);
  });

  it('treats a blank start or end as unbounded on that side', () => {
    expect(isWithinAvailabilityRange('2024-01-01', { start: '', end: '2024-06-10' })).toBe(true);
    expect(isWithinAvailabilityRange('2030-01-01', { start: '2024-06-01', end: '' })).toBe(true);
    expect(isWithinAvailabilityRange('2024-06-05', { start: '', end: '' })).toBe(true);
  });
});

describe('Listings search debounce', () => {
  it('does not filter before 400ms, but does after', () => {
    vi.useFakeTimers();
    try {
      const listings: Listing[] = [
        makeListing({ id: 'l-1', description: 'Spacious two bedroom flat' }),
        makeListing({ id: 'l-2', description: 'Cozy studio near the park' }),
      ];

      render(
        <Listings
          listings={listings}
          properties={properties}
          propertyTypes={propertyTypes}
          propertiesLoading={false}
          onAdd={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const search = screen.getByLabelText('Search description');
      fireEvent.change(search, { target: { value: 'studio' } });

      // Before 400ms elapses, both rows must still be present — no filter has fired yet.
      act(() => {
        vi.advanceTimersByTime(399);
      });
      expect(screen.getAllByText('Sunrise Apartments')).toHaveLength(2);

      // After 400ms total, the debounced query takes effect and the filter runs.
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getAllByText('Sunrise Apartments')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Listings filter + pagination composition', () => {
  it('preserves an active search term and sort across a page change', () => {
    vi.useFakeTimers();
    try {
      // 25 listings whose description matches "match-me" so filtering leaves > PAGE_SIZE (20)
      // rows and pagination is exercised; rent is varied to make the sort observable.
      const matching: Listing[] = Array.from({ length: 25 }, (_, i) =>
        makeListing({
          id: `match-${i}`,
          description: `match-me listing number ${i}`,
          expectedRent: 10000 + i * 100,
        })
      );
      const nonMatching: Listing[] = [
        makeListing({ id: 'other-1', description: 'irrelevant listing' }),
      ];
      const listings = [...matching, ...nonMatching];

      render(
        <Listings
          listings={listings}
          properties={properties}
          propertyTypes={propertyTypes}
          propertiesLoading={false}
          onAdd={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const search = screen.getByLabelText('Search description');
      fireEvent.change(search, { target: { value: 'match-me' } });
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Sort ascending by expected rent.
      fireEvent.click(screen.getByRole('columnheader', { name: /Expected rent/ }));

      // Page 1 shows the lowest-rent matching row (10000).
      expect(screen.getByText('10000')).toBeInTheDocument();
      expect(screen.queryByText('irrelevant listing')).not.toBeInTheDocument();

      // Move to page 2 — the search box and sort must both remain applied, and page 2 must
      // show the filtered+sorted continuation, not the next slice of the unfiltered list.
      fireEvent.click(screen.getByText('›'));

      expect((search as HTMLInputElement).value).toBe('match-me');
      // The 21st matching row by ascending rent (index 20) has rent 12000.
      expect(screen.getByText('12000')).toBeInTheDocument();
      // The lowest-rent row from page 1 should no longer be visible.
      expect(screen.queryByText('10000')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Listings filter + pagination composition (status, property type, availability)', () => {
  it('keeps status, property type, and availability filters (together with search and sort) applied across a page change', () => {
    vi.useFakeTimers();
    try {
      const matching: Listing[] = Array.from({ length: 25 }, (_, i) =>
        makeListing({
          id: `all-match-${i}`,
          description: `match-me listing number ${i}`,
          expectedRent: 10000 + i * 100,
          status: 'LIVE',
          propertyId: 'prop-1',
          availableFrom: '2024-06-05',
        })
      );
      const nonMatching: Listing[] = [
        makeListing({
          id: 'wrong-status',
          description: 'match-me wrong status',
          status: 'DRAFT',
          propertyId: 'prop-1',
          availableFrom: '2024-06-05',
        }),
        makeListing({
          id: 'wrong-property',
          description: 'match-me wrong property',
          status: 'LIVE',
          propertyId: 'prop-2',
          availableFrom: '2024-06-05',
        }),
        makeListing({
          id: 'wrong-availability',
          description: 'match-me wrong availability',
          status: 'LIVE',
          propertyId: 'prop-1',
          availableFrom: '2023-01-01',
        }),
      ];
      const listings = [...matching, ...nonMatching];

      const { container } = render(
        <Listings
          listings={listings}
          properties={properties}
          propertyTypes={propertyTypes}
          propertiesLoading={false}
          onAdd={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const search = screen.getByLabelText('Search description');
      fireEvent.change(search, { target: { value: 'match-me' } });
      act(() => {
        vi.advanceTimersByTime(400);
      });

      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'LIVE' } });
      fireEvent.change(screen.getByLabelText('Property type'), { target: { value: 'pt-1' } });

      const availabilityStart = container.querySelector('#availabilityStart') as HTMLInputElement;
      const availabilityEnd = container.querySelector('#availabilityEnd') as HTMLInputElement;
      fireEvent.change(availabilityStart, { target: { value: '2024-01-01' } });
      fireEvent.change(availabilityEnd, { target: { value: '2024-12-31' } });

      fireEvent.click(screen.getByRole('columnheader', { name: /Expected rent/ }));

      // Only the 25 status/propertyType/availability-matching rows survive; the three
      // deliberately-mismatched rows never appear on either page.
      expect(screen.queryByText('match-me wrong status')).not.toBeInTheDocument();
      expect(screen.queryByText('match-me wrong property')).not.toBeInTheDocument();
      expect(screen.queryByText('match-me wrong availability')).not.toBeInTheDocument();

      // Page 1, ascending by rent: lowest-rent matching row (10000).
      expect(screen.getByText('10000')).toBeInTheDocument();

      fireEvent.click(screen.getByText('›'));

      // All four filters (search, status, property type, availability) plus the sort remain
      // applied after paging — not reset to their defaults.
      expect((search as HTMLInputElement).value).toBe('match-me');
      expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('LIVE');
      expect((screen.getByLabelText('Property type') as HTMLSelectElement).value).toBe('pt-1');
      expect((container.querySelector('#availabilityStart') as HTMLInputElement).value).toBe('2024-01-01');
      expect((container.querySelector('#availabilityEnd') as HTMLInputElement).value).toBe('2024-12-31');

      // The 21st matching row by ascending rent (index 20) has rent 12000; the first page's
      // lowest-rent row must no longer be visible.
      expect(screen.getByText('12000')).toBeInTheDocument();
      expect(screen.queryByText('10000')).not.toBeInTheDocument();
      expect(screen.queryByText('match-me wrong property')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
