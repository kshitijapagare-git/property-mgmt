import type { Listing } from './types';

/**
 * Pure one-time default for a new Application's `offeredRent`: reads the linked Listing's
 * current `expectedRent` at the moment a viewing/listing is first selected on a brand-new
 * Application form. Callers must invoke this only once (on selection while creating), never on
 * every render or when editing an already-saved Application — the stored `offeredRent` on the
 * Application object is the only source of truth once saved, so later edits to the Listing must
 * never retroactively change it.
 */
export function defaultOfferedRentForListing(listing: Listing | undefined): number {
  return listing ? listing.expectedRent : 0;
}
