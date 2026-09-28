import { useEffect, useState } from 'react';
import Landlords from './Landlords';
import Localities from './Localities';
import Property from './Property';
import Listings from './Listings';
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

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/landlords');
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [propertiesLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/landlords');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const addLandlord = (landlord: LandlordFormValues) =>
    setLandlords((prev) => [...prev, { ...landlord, id: crypto.randomUUID() }]);

  const deleteLandlord = (id: string) => {
    if (localities.some((l) => l.landlordId === id)) {
      alert('Cannot delete: landlord has localities.');
      return;
    }
    setLandlords((prev) => prev.filter((l) => l.id !== id));
  };

  const addLocality = (locality: LocalityFormValues) =>
    setLocalities((prev) => [...prev, { ...locality, id: crypto.randomUUID() }]);

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
          <Landlords landlords={landlords} onAdd={addLandlord} onDelete={deleteLandlord} />
        )}
      </main>
    </div>
  );
}
