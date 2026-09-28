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

/**
 * Minimal scaffold: the ticket's acceptance criteria assume a PropertyType entity/CRUD already
 * exists (it doesn't, in this repo). Only the type and a live list are added here so the
 * Listings `propertyTypeId` filter has real data to read — a full PropertyType management
 * screen is out of scope for this change.
 */
export interface PropertyType {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  name: string;
  localityId: string;
  /** Optional so existing Property CRUD (which has no UI for this yet) is unaffected. */
  propertyTypeId?: string;
}

/** The fixed set of ID proof documents a Tenant can be identified by. */
export type IdProofType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENCE';

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idProofType: IdProofType | '';
  idProofNumber: string;
}

/** A modal form's fields — the entity without its `id`, which is assigned on create. */
export type LandlordFormValues = Omit<Landlord, 'id'>;
export type LocalityFormValues = Omit<Locality, 'id'>;
export type PropertyFormValues = Omit<Property, 'id'>;
export type TenantFormValues = Omit<Tenant, 'id'>;

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

export interface Viewing {
  id: string;
  listingId: string;
  prospectName: string;
  phone: string;
  scheduledOn: string;
  slot: string;
  isConfirmed: boolean;
}

export type ViewingFormValues = Omit<Viewing, 'id'>;

export type ApplicationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Application {
  id: string;
  viewingId: string;
  tenantId: string;
  offeredRent: number;
  moveInDate: string;
  notes: string;
  status: ApplicationStatus;
}

export type ApplicationFormValues = Omit<Application, 'id'>;

export type LeaseStatus = 'DRAFT' | 'ACTIVE' | 'TERMINATED';

export interface Lease {
  id: string;
  applicationId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  rentDueDay: number;
  lockInMonths: number;
  status: LeaseStatus;
  /** Populated only when status is TERMINATED. */
  terminationDate?: string;
  /** Populated only when status is TERMINATED. */
  terminationReason?: string;
}

export type LeaseFormValues = Omit<Lease, 'id'>;

/** The fixed set of categories a MaintenanceRequest can be classified under. */
export type MaintenanceCategory = 'PLUMBING' | 'ELECTRICAL' | 'APPLIANCE' | 'STRUCTURAL' | 'OTHER';

/** The fixed set of priority levels a MaintenanceRequest can be assigned. */
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/** The fixed set of statuses a MaintenanceRequest can be in — also the Kanban board's columns. */
export type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED';

/** Who a resolved MaintenanceRequest's cost is charged to. Billing TENANT charges is PRC-219's concern. */
export type ChargeTo = 'OWNER' | 'TENANT';

export interface MaintenanceRequest {
  id: string;
  leaseId: string;
  title: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  description: DescriptionHtml;
  reportedOn: string;
  status: MaintenanceStatus;
  /** Populated only once status is RESOLVED. */
  resolvedOn?: string;
  /** Populated only once status is RESOLVED. */
  cost?: number;
  chargeTo: ChargeTo;
}

export type MaintenanceFormValues = Omit<MaintenanceRequest, 'id'>;
