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

/** A modal form's fields — the entity without its `id`, which is assigned on create. */
export type LandlordFormValues = Omit<Landlord, 'id'>;
export type LocalityFormValues = Omit<Locality, 'id'>;
