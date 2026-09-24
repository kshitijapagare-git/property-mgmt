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
  landlordId: string;
}

/** The modal form's fields — a record without the `id`, which is assigned on create. */
export type LandlordFormValues = Omit<Landlord, 'id'>;
export type LocalityFormValues = Omit<Locality, 'id'>;

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
