import { useEffect, useState } from 'react';
import Landlords from './Landlords';
import Localities from './Localities';
import Property from './Property';
import Listings from './Listings';
import Viewings from './Viewings';
import Tenants from './Tenants';
import Applications, { applyApproval } from './Applications';
import MaintenanceRequests from './MaintenanceRequests';
import ConfirmDialog from './ConfirmDialog';
import { applyStatusChange } from './maintenanceLogic';
import type {
  Application,
  ApplicationFormValues,
  Landlord,
  LandlordFormValues,
  Lease,
  Listing,
  ListingFormValues,
  Locality,
  LocalityFormValues,
  MaintenanceFormValues,
  MaintenanceRequest,
  MaintenanceStatus,
  Property as PropertyEntity,
  PropertyFormValues,
  PropertyType,
  Tenant,
  TenantFormValues,
  Viewing,
  ViewingFormValues,
} from './types';
import { seedLeases, seedListings, seedMaintenanceRequests, seedProperties, seedPropertyTypes, seedTenants, seedViewings } from './seedData';

const routes = [
  { path: '#/landlords', label: 'Landlords', icon: '👤' },
  { path: '#/localities', label: 'Localities', icon: '📍' },
  { path: '#/properties', label: 'Properties', icon: '🏢' },
  { path: '#/listings', label: 'Listings', icon: '📋' },
  { path: '#/viewings', label: 'Viewings', icon: '📅' },
  { path: '#/tenants', label: 'Tenants', icon: '🧑' },
  { path: '#/applications', label: 'Applications', icon: '📝' },
  { path: '#/maintenance', label: 'Maintenance', icon: '🔧' },
];

/**
 * Pure delete-guard logic for a Landlord: whether deletion should be blocked, and the exact
 * message to show, given how many Localities currently reference that landlord. Exported so it
 * can be unit-tested directly (see Landlords.test.tsx) without depending on the ConfirmDialog's
 * rendered markup.
 */
export function getDeleteLandlordGuard(landlordId: string, localities: Locality[]): { disabled: boolean; message: string } {
  const count = localities.filter((l) => l.landlordId === landlordId).length;
  if (count === 0) {
    return { disabled: false, message: 'Are you sure you want to delete this landlord?' };
  }
  return { disabled: true, message: `Cannot delete: ${count} ${count === 1 ? 'locality' : 'localities'}` };
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/listings');
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [properties, setProperties] = useState<PropertyEntity[]>(seedProperties);
  const [propertiesLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>(seedListings);
  const [propertyTypes] = useState<PropertyType[]>(seedPropertyTypes);
  const [viewings, setViewings] = useState<Viewing[]>(seedViewings);
  const [tenants, setTenants] = useState<Tenant[]>(seedTenants);
  const [applications, setApplications] = useState<Application[]>([]);
  const [leases] = useState<Lease[]>(seedLeases);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(seedMaintenanceRequests);
  const [confirmDeleteLandlordId, setConfirmDeleteLandlordId] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/listings');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const addLandlord = (landlord: LandlordFormValues) =>
    setLandlords((prev) => [...prev, { ...landlord, id: crypto.randomUUID() }]);

  const updateLandlord = (id: string, landlord: LandlordFormValues) =>
    setLandlords((prev) => prev.map((l) => (l.id === id ? { ...landlord, id } : l)));

  // Opens the blocking ConfirmDialog instead of deleting outright; the dialog itself disables
  // its confirm action (via getDeleteLandlordGuard) when the landlord still has localities.
  const requestDeleteLandlord = (id: string) => setConfirmDeleteLandlordId(id);

  const cancelDeleteLandlord = () => setConfirmDeleteLandlordId(null);

  const confirmDeleteLandlord = () => {
    if (!confirmDeleteLandlordId) return;
    const guard = getDeleteLandlordGuard(confirmDeleteLandlordId, localities);
    if (guard.disabled) return;
    setLandlords((prev) => prev.filter((l) => l.id !== confirmDeleteLandlordId));
    setConfirmDeleteLandlordId(null);
  };

  const addLocality = (locality: LocalityFormValues) =>
    setLocalities((prev) => [...prev, { ...locality, id: crypto.randomUUID() }]);

  const updateLocality = (id: string, locality: LocalityFormValues) =>
    setLocalities((prev) => prev.map((l) => (l.id === id ? { ...locality, id } : l)));

  const deleteLocality = (id: string) =>
    setLocalities((prev) => prev.filter((l) => l.id !== id));

  const addProperty = (property: PropertyFormValues) =>
    setProperties((prev) => [...prev, { ...property, id: crypto.randomUUID() }]);

  const deleteProperty = (id: string) =>
    setProperties((prev) => prev.filter((p) => p.id !== id));

  const addListing = (listing: ListingFormValues) =>
    setListings((prev) => [...prev, { ...listing, id: crypto.randomUUID() }]);

  const updateListing = (id: string, listing: ListingFormValues) =>
    setListings((prev) => prev.map((l) => (l.id === id ? { ...listing, id } : l)));

  const deleteListing = (id: string) =>
    setListings((prev) => prev.filter((l) => l.id !== id));

  const addViewing = (viewing: ViewingFormValues) =>
    setViewings((prev) => [...prev, { ...viewing, id: crypto.randomUUID() }]);

  const updateViewing = (id: string, viewing: ViewingFormValues) =>
    setViewings((prev) => prev.map((v) => (v.id === id ? { ...viewing, id } : v)));

  const deleteViewing = (id: string) =>
    setViewings((prev) => prev.filter((v) => v.id !== id));

  const addTenant = (tenant: TenantFormValues) =>
    setTenants((prev) => [...prev, { ...tenant, id: crypto.randomUUID() }]);

  const updateTenant = (id: string, tenant: TenantFormValues) =>
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...tenant, id } : t)));

  const deleteTenant = (id: string) =>
    setTenants((prev) => prev.filter((t) => t.id !== id));

  const addApplication = (application: ApplicationFormValues) =>
    setApplications((prev) => [...prev, { ...application, id: crypto.randomUUID() }]);

  const updateApplication = (id: string, application: ApplicationFormValues) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...application, id } : a)));

  const deleteApplication = (id: string) =>
    setApplications((prev) => prev.filter((a) => a.id !== id));

  // Keeps the approve → Listing UNDER_OFFER update in one function, delegating to
  // Applications.tsx's applyApproval so a later ticket can reuse the same pattern.
  const approveApplication = (id: string) => {
    const application = applications.find((a) => a.id === id);
    if (!application) return;
    const result = applyApproval(application, viewings, listings);
    setApplications((prev) => prev.map((a) => (a.id === id ? result.application : a)));
    setListings(result.listings);
  };

  const addMaintenanceRequest = (request: MaintenanceFormValues) =>
    setMaintenanceRequests((prev) => [...prev, { ...request, id: crypto.randomUUID() }]);

  const updateMaintenanceRequest = (id: string, request: MaintenanceFormValues) =>
    setMaintenanceRequests((prev) => prev.map((r) => (r.id === id ? { ...request, id } : r)));

  const deleteMaintenanceRequest = (id: string) =>
    setMaintenanceRequests((prev) => prev.filter((r) => r.id !== id));

  // Single commit point for a status change originating from either the Kanban board's drag
  // handler/keyboard-alternative select or the create/edit form, delegating to
  // maintenanceLogic.applyStatusChange so the RESOLVED gate can never be bypassed either way.
  const changeMaintenanceStatus = (
    id: string,
    nextStatus: MaintenanceStatus,
    resolution?: { resolvedOn: string; cost: number }
  ) => {
    const request = maintenanceRequests.find((r) => r.id === id);
    if (!request) return;
    const result = applyStatusChange(request, nextStatus, resolution);
    if (!result.ok) return;
    setMaintenanceRequests((prev) => prev.map((r) => (r.id === id ? result.request : r)));
  };

  const deleteLandlordGuard = confirmDeleteLandlordId
    ? getDeleteLandlordGuard(confirmDeleteLandlordId, localities)
    : null;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">🏠 Property Management</div>
        {routes.map((r) => (
          <a key={r.path} href={r.path} className={`nav-link ${route === r.path ? 'active' : ''}`}>
            <span>{r.icon}</span>
            {r.label}
          </a>
        ))}
      </aside>
      <main className="main">
        {route === '#/localities' ? (
          <Localities
            localities={localities}
            landlords={landlords}
            onAdd={addLocality}
            onUpdate={updateLocality}
            onDelete={deleteLocality}
          />
        ) : route === '#/properties' ? (
          <Property
            properties={properties}
            localities={localities}
            onAdd={addProperty}
            onDelete={deleteProperty}
          />
        ) : route === '#/listings' ? (
          <Listings
            listings={listings}
            properties={properties}
            propertyTypes={propertyTypes}
            propertiesLoading={propertiesLoading}
            onAdd={addListing}
            onUpdate={updateListing}
            onDelete={deleteListing}
          />
        ) : route === '#/viewings' ? (
          <Viewings
            viewings={viewings}
            listings={listings}
            properties={properties}
            onAdd={addViewing}
            onUpdate={updateViewing}
            onDelete={deleteViewing}
          />
        ) : route === '#/tenants' ? (
          <Tenants
            tenants={tenants}
            onAdd={addTenant}
            onUpdate={updateTenant}
            onDelete={deleteTenant}
          />
        ) : route === '#/applications' ? (
          <Applications
            applications={applications}
            viewings={viewings}
            listings={listings}
            properties={properties}
            tenants={tenants}
            onAdd={addApplication}
            onUpdate={updateApplication}
            onDelete={deleteApplication}
            onApprove={approveApplication}
          />
        ) : route === '#/maintenance' ? (
          <MaintenanceRequests
            requests={maintenanceRequests}
            leases={leases}
            onAdd={addMaintenanceRequest}
            onUpdate={updateMaintenanceRequest}
            onDelete={deleteMaintenanceRequest}
            onStatusChange={changeMaintenanceStatus}
          />
        ) : (
          <Landlords
            landlords={landlords}
            onAdd={addLandlord}
            onUpdate={updateLandlord}
            onDelete={requestDeleteLandlord}
          />
        )}
      </main>

      {confirmDeleteLandlordId && deleteLandlordGuard && (
        <ConfirmDialog
          title="Delete landlord"
          message={deleteLandlordGuard.message}
          confirmDisabled={deleteLandlordGuard.disabled}
          confirmLabel="Delete"
          onConfirm={confirmDeleteLandlord}
          onCancel={cancelDeleteLandlord}
        />
      )}
    </div>
  );
}
