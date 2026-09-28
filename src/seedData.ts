import type {
  Amenity,
  Landlord,
  Listing,
  ListingStatus,
  Locality,
  Property,
  PropertyType,
  Tenant,
  Viewing,
} from './types';

/**
 * Sample data for manual QA against the Listings search/filter/sort/pagination pipeline and the
 * Viewings CRUD + Calendar. Not wired into App.tsx by this file itself — whichever change wires
 * initial state should import these and seed useState with them. Ids are deterministic strings
 * (not crypto.randomUUID()) so the fixtures read predictably while poking around manually.
 */

export const seedLandlords: Landlord[] = [
  { id: 'landlord-1', firstName: 'Asha', lastName: 'Rao', email: 'asha.rao@example.com', phone: '9800000001' },
  { id: 'landlord-2', firstName: 'Vikram', lastName: 'Shah', email: 'vikram.shah@example.com', phone: '9800000002' },
  { id: 'landlord-3', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@example.com', phone: '9800000003' },
];

export const seedLocalities: Locality[] = [
  { id: 'locality-1', name: 'Koramangala', pincode: '560034', city: 'Bengaluru', zone: 'South', landlordId: 'landlord-1' },
  { id: 'locality-2', name: 'Indiranagar', pincode: '560038', city: 'Bengaluru', zone: 'East', landlordId: 'landlord-2' },
  { id: 'locality-3', name: 'Powai', pincode: '400076', city: 'Mumbai', zone: 'North', landlordId: 'landlord-3' },
];

export const seedPropertyTypes: PropertyType[] = [
  { id: 'ptype-apartment', name: 'Apartment' },
  { id: 'ptype-villa', name: 'Villa' },
  { id: 'ptype-studio', name: 'Studio' },
];

export const seedProperties: Property[] = [
  { id: 'property-1', name: 'Sunrise Apartments', localityId: 'locality-1', propertyTypeId: 'ptype-apartment' },
  { id: 'property-2', name: 'Green Valley Villas', localityId: 'locality-1', propertyTypeId: 'ptype-villa' },
  { id: 'property-3', name: 'City Studios', localityId: 'locality-2', propertyTypeId: 'ptype-studio' },
  { id: 'property-4', name: 'Lakeview Apartments', localityId: 'locality-2', propertyTypeId: 'ptype-apartment' },
  { id: 'property-5', name: 'Palm Villas', localityId: 'locality-3', propertyTypeId: 'ptype-villa' },
  { id: 'property-6', name: 'Downtown Studios', localityId: 'locality-3', propertyTypeId: 'ptype-studio' },
];

const STATUS_CYCLE: ListingStatus[] = ['DRAFT', 'LIVE', 'UNDER_OFFER', 'LET'];
const AMENITY_SETS: Amenity[][] = [
  ['LIFT', 'PARKING'],
  ['POWER_BACKUP', 'GYM'],
  ['SECURITY', 'PET_FRIENDLY'],
  ['LIFT', 'PARKING', 'GYM', 'SECURITY'],
  [],
];

const LISTING_COUNT = 66;

const pad = (n: number) => String(n).padStart(2, '0');

/** Deterministic date `LISTING_COUNT` days apart, spread across 2024 for varied availableFrom filtering. */
const availableFromForIndex = (index: number): string => {
  const dayOfYear = 5 + index * 5; // spreads availableFrom widely across the year
  const date = new Date(Date.UTC(2024, 0, 1));
  date.setUTCDate(date.getUTCDate() + dayOfYear);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

const availableToForIndex = (index: number): string => {
  const from = availableFromForIndex(index);
  const date = new Date(`${from}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 6);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

export const seedListings: Listing[] = Array.from({ length: LISTING_COUNT }, (_, i) => {
  const property = seedProperties[i % seedProperties.length];
  const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
  const amenities = AMENITY_SETS[i % AMENITY_SETS.length];
  // Rent spans roughly ₹8,000 to ₹85,000 so the RangeSlider's live-computed min/max both move.
  const expectedRent = 8000 + (i % 20) * 4000 + (i % 3) * 500;

  return {
    id: `listing-${i + 1}`,
    propertyId: property.id,
    expectedRent,
    availableFrom: availableFromForIndex(i),
    availableTo: availableToForIndex(i),
    description: `<p>${property.name} — a well-lit ${amenities.length ? amenities.join(', ').toLowerCase() : 'no-frills'} home, listing #${i + 1}.</p>`,
    amenities,
    status,
  };
});

const PROSPECT_NAMES = [
  'Ananya Iyer', 'Rohit Mehta', 'Sara Khan', 'Devansh Gupta', 'Meera Pillai',
  'Arjun Reddy', 'Neha Kapoor', 'Kabir Joshi', 'Ishita Bose', 'Yash Malhotra',
];

const SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'];

export const seedViewings: Viewing[] = Array.from({ length: 15 }, (_, i) => {
  const listing = seedListings[i * 4 % seedListings.length];
  const day = 3 + i;
  return {
    id: `viewing-${i + 1}`,
    listingId: listing.id,
    prospectName: PROSPECT_NAMES[i % PROSPECT_NAMES.length],
    phone: `98${String(10000000 + i).slice(0, 8)}`,
    scheduledOn: `2024-06-${pad(((day - 1) % 28) + 1)}`,
    slot: SLOTS[i % SLOTS.length],
    isConfirmed: i % 3 !== 0,
  };
});

/**
 * Deterministic Tenant fixtures for manual QA against the Tenant CRUD screen: covers all four
 * IdProofType values plus one tenant left with idProofType/idProofNumber blank, so every
 * validation path (required-once-chosen, cleared-on-blank) has a real starting record to edit.
 */
export const seedTenants: Tenant[] = [
  { id: 'tenant-1', firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@example.com', phone: '9700000001', idProofType: 'AADHAAR', idProofNumber: '234512345678' },
  { id: 'tenant-2', firstName: 'Sneha', lastName: 'Kulkarni', email: 'sneha.kulkarni@example.com', phone: '9700000002', idProofType: 'PAN', idProofNumber: 'ABCPK1234D' },
  { id: 'tenant-3', firstName: 'Amit', lastName: 'Joshi', email: 'amit.joshi@example.com', phone: '9700000003', idProofType: 'PASSPORT', idProofNumber: 'P1234567' },
  { id: 'tenant-4', firstName: 'Divya', lastName: 'Menon', email: 'divya.menon@example.com', phone: '9700000004', idProofType: 'DRIVING_LICENCE', idProofNumber: 'KA0120230012345' },
  { id: 'tenant-5', firstName: 'Karan', lastName: 'Chopra', email: 'karan.chopra@example.com', phone: '9700000005', idProofType: '', idProofNumber: '' },
];
