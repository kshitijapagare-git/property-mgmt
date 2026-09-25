import type { ReactNode } from 'react';

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

export type PropertyTypeName = 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PG' | 'COMMERCIAL';

export interface PropertyType {
  id: string;
  name: PropertyTypeName;
  /** Integer minor currency units (paise/cents), matching the API's wire type. */
  defaultDeposit: number;
}

export type Furnishing = 'UNFURNISHED' | 'SEMI' | 'FULL';

export type ListingStatus = 'DRAFT' | 'LIVE' | 'UNDER_OFFER' | 'LET';

export type Amenity = 'LIFT' | 'PARKING' | 'POWER_BACKUP' | 'GYM' | 'SECURITY' | 'PET_FRIENDLY';

export interface Property {
  id: string;
  title: string;
  localityId: string;
  propertyTypeId: string;
  bedrooms: number;
  bathrooms: number;
  carpetAreaSqft: number;
  furnishing: Furnishing;
  /** null means unrated; a star rating of 0 is not a valid state. */
  conditionRating: number | null;
  /** ISO date string. */
  builtOn: string;
}

export interface Listing {
  id: string;
  propertyId: string;
  expectedRent: number;
  /** ISO date string. */
  availableFrom: string;
  /** ISO date string. */
  availableTo: string;
  /** HTML string from the RichTextEditor. */
  description: string;
  amenities: Amenity[];
  status: ListingStatus;
}

/** The modal form's fields — a record without the `id`, which is assigned on create. */
export type LandlordFormValues = Omit<Landlord, 'id'>;
export type LocalityFormValues = Omit<Locality, 'id'>;
export type PropertyTypeFormValues = Omit<PropertyType, 'id'>;
export type PropertyFormValues = Omit<Property, 'id'>;
export type ListingFormValues = Omit<Listing, 'id'>;

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * `key` is a plain string rather than `keyof T` on purpose: a column may be derived
 * rather than stored (Localities' "landlord" column has no such field on the row and
 * supplies `render` instead), so constraining it to the row's own keys would reject a
 * column the UI legitimately has.
 */
export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}
