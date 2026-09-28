import { describe, expect, it } from 'vitest';
import { applyApproval, getConfirmedViewings } from './Applications';
import type { Application, Listing, Viewing } from './types';

const makeViewing = (overrides: Partial<Viewing> = {}): Viewing => ({
  id: 'viewing-1',
  listingId: 'listing-1',
  prospectName: 'Ananya Iyer',
  phone: '9812345678',
  scheduledOn: '2024-06-01',
  slot: '10:00',
  isConfirmed: false,
  ...overrides,
});

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

const makeApplication = (overrides: Partial<Application> = {}): Application => ({
  id: 'application-1',
  viewingId: 'viewing-1',
  tenantId: 'tenant-1',
  offeredRent: 20000,
  moveInDate: '2024-08-01',
  notes: '',
  status: 'SUBMITTED',
  ...overrides,
});

describe('getConfirmedViewings', () => {
  it('excludes viewings where isConfirmed is false', () => {
    const unconfirmed = makeViewing({ id: 'viewing-unconfirmed', isConfirmed: false });
    const result = getConfirmedViewings([unconfirmed]);
    expect(result).not.toContainEqual(unconfirmed);
    expect(result).toHaveLength(0);
  });

  it('includes viewings where isConfirmed is true', () => {
    const confirmed = makeViewing({ id: 'viewing-confirmed', isConfirmed: true });
    const unconfirmed = makeViewing({ id: 'viewing-unconfirmed', isConfirmed: false });
    const result = getConfirmedViewings([confirmed, unconfirmed]);
    expect(result).toContainEqual(confirmed);
    expect(result).toHaveLength(1);
  });
});

describe('applyApproval', () => {
  it('sets the application status to APPROVED', () => {
    const viewing = makeViewing({ id: 'viewing-1', listingId: 'listing-1', isConfirmed: true });
    const listing = makeListing({ id: 'listing-1', status: 'LIVE' });
    const application = makeApplication({ viewingId: 'viewing-1', status: 'SUBMITTED' });

    const result = applyApproval(application, [viewing], [listing]);

    expect(result.application.status).toBe('APPROVED');
  });

  it('sets only the linked listing to UNDER_OFFER, leaving other listings unchanged', () => {
    const viewing = makeViewing({ id: 'viewing-1', listingId: 'listing-1', isConfirmed: true });
    const linkedListing = makeListing({ id: 'listing-1', status: 'LIVE' });
    const otherListing = makeListing({ id: 'listing-2', status: 'DRAFT' });
    const application = makeApplication({ viewingId: 'viewing-1' });

    const result = applyApproval(application, [viewing], [linkedListing, otherListing]);

    const updatedLinked = result.listings.find((l) => l.id === 'listing-1');
    const updatedOther = result.listings.find((l) => l.id === 'listing-2');
    expect(updatedLinked?.status).toBe('UNDER_OFFER');
    expect(updatedOther?.status).toBe('DRAFT');
  });

  it('returns a new listings array reference rather than mutating the input', () => {
    const viewing = makeViewing({ id: 'viewing-1', listingId: 'listing-1', isConfirmed: true });
    const originalListings = [makeListing({ id: 'listing-1', status: 'LIVE' })];
    const application = makeApplication({ viewingId: 'viewing-1' });

    const result = applyApproval(application, [viewing], originalListings);

    expect(result.listings).not.toBe(originalListings);
    expect(originalListings[0].status).toBe('LIVE');
  });
});
