export interface Landlord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Locality {
  id: string;
  name: string;
  pincode: string;
  city: string;
  zone: string;
  landlordId: string;
}

export interface Property {
  id: string;
  name: string;
  localityId: string;
}

/** A modal form's fields — the entity without its `id`, which is assigned on create. */
export type LandlordFormValues = Omit<Landlord, 'id'>;
export type LocalityFormValues = Omit<Locality, 'id'>;
export type PropertyFormValues = Omit<Property, 'id'>;

/** The fixed set of amenities a Listing can advertise. */
export type Amenity = 'LIFT' | 'PARKING' | 'POWER_BACKUP' | 'GYM' | 'SECURITY' | 'PET_FRIENDLY';

/**
 * Raw HTML string, as produced/consumed by RichTextEditor. Confirmed against the rest of the
 * codebase: no pre-existing description-like field commits the app to a portable/markdown
 * format, so per clarification the description is stored and sent as HTML, persisted as-is.
 */
export type DescriptionHtml = string;

export type ListingStatus = 'DRAFT' | 'LIVE' | 'UNDER_OFFER' | 'LET';

export interface Listing {
  id: string;
  propertyId: string;
  expectedRent: number;
  availableFrom: string;
  availableTo: string;
  description: DescriptionHtml;
  amenities: Amenity[];
  status: ListingStatus;
}

export type ListingFormValues = Omit<Listing, 'id'>;
