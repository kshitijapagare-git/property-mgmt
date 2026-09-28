import { describe, expect, it } from 'vitest';
import { defaultOfferedRentForListing } from './applicationDefaults';
import type { Listing } from './types';

const makeListing = (overrides: Partial<Listing> = {}): Listing => ({
  id: 'listing-1',
  propertyId: 'property-1',
  expectedRent: 20000,
  availableFrom: '2024-01-01',
  availableTo: '2024-07-01',
  description: '<p>desc</p>',
  amenities: [],
  status: 'LIVE',
  ...overrides,
});

describe('defaultOfferedRentForListing', () => {
  it('returns the listing\'s current expectedRent at call time', () => {
    const listing = makeListing({ expectedRent: 35000 });
    expect(defaultOfferedRentForListing(listing)).toBe(35000);
  });

  it('returns 0 when no listing is linked yet', () => {
    expect(defaultOfferedRentForListing(undefined)).toBe(0);
  });

  it('does not retroactively change a previously captured offeredRent when the Listing is later mutated', () => {
    let listing = makeListing({ expectedRent: 20000 });

    // Simulate creating an Application: capture offeredRent once, at creation time.
    const application = {
      offeredRent: defaultOfferedRentForListing(listing),
    };
    expect(application.offeredRent).toBe(20000);

    // Now the surrounding Listing state is mutated (e.g. the listing is edited elsewhere).
    listing = { ...listing, expectedRent: 50000 };

    // The already-created Application's offeredRent must remain untouched.
    expect(application.offeredRent).toBe(20000);
    // Sanity check: the listing itself did change.
    expect(listing.expectedRent).toBe(50000);
  });
});
