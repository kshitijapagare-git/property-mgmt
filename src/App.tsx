import { useEffect, useState } from 'react';
import Landlords from './Landlords';
import Localities from './Localities';
import Property from './Property';
import Listings from './Listings';
import ConfirmDialog from './ConfirmDialog';
import type {
  Landlord,
  LandlordFormValues,
  Listing,
  ListingFormValues,
  Locality,
  LocalityFormValues,
  Property as PropertyType,
  PropertyFormValues,
} from './types';

const routes = [
  { path: '#/landlords', label: 'Landlords', icon: '👤' },
  { path: '#/localities', label: 'Localities', icon: '📍' },
  { path: '#/properties', label: 'Properties', icon: '🏢' },
  { path: '#/listings', label: 'Listings', icon: '📋' },
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
  const [route, setRoute] = useState(window.location.hash || '#/landlords');
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [propertiesLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [confirmDeleteLandlordId, setConfirmDeleteLandlordId] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/landlords');
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
            propertiesLoading={propertiesLoading}
            onAdd={addListing}
            onUpdate={updateListing}
            onDelete={deleteListing}
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
