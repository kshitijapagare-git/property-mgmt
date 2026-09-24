import { useEffect, useState } from 'react';
import Landlords from './Landlords';
import Localities from './Localities';
import PropertyTypes from './PropertyTypes';
import Properties from './Properties';
import { getLandlordDeleteBlockMessage } from './utils/landlordDeleteGuard';
import type {
  Landlord,
  LandlordFormValues,
  Locality,
  LocalityFormValues,
  Property,
  PropertyFormValues,
  PropertyType,
  PropertyTypeFormValues,
} from './types';

const routes = [
  { path: '#/landlords', label: 'Landlords', icon: '👤' },
  { path: '#/localities', label: 'Localities', icon: '📍' },
  { path: '#/property-types', label: 'Property Types', icon: '🏢' },
  { path: '#/properties', label: 'Properties', icon: '🏘️' },
];

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/landlords');
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/landlords');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const addLandlord = (landlord: LandlordFormValues) =>
    setLandlords((prev) => [...prev, { ...landlord, id: crypto.randomUUID() }]);

  const updateLandlord = (id: string, landlord: LandlordFormValues) =>
    setLandlords((prev) => prev.map((l) => (l.id === id ? { ...l, ...landlord } : l)));

  const deleteLandlord = (id: string) => {
    const message = getLandlordDeleteBlockMessage(id, localities);
    if (message) {
      alert(message);
      return;
    }
    setLandlords((prev) => prev.filter((l) => l.id !== id));
  };

  const addLocality = (locality: LocalityFormValues) =>
    setLocalities((prev) => [...prev, { ...locality, id: crypto.randomUUID() }]);

  const updateLocality = (id: string, locality: LocalityFormValues) =>
    setLocalities((prev) => prev.map((l) => (l.id === id ? { ...l, ...locality } : l)));

  const deleteLocality = (id: string) =>
    setLocalities((prev) => prev.filter((l) => l.id !== id));

  const addPropertyType = (propertyType: PropertyTypeFormValues) =>
    setPropertyTypes((prev) => [...prev, { ...propertyType, id: crypto.randomUUID() }]);

  const updatePropertyType = (id: string, propertyType: PropertyTypeFormValues) =>
    setPropertyTypes((prev) => prev.map((pt) => (pt.id === id ? { ...pt, ...propertyType } : pt)));

  const deletePropertyType = (id: string) =>
    setPropertyTypes((prev) => prev.filter((pt) => pt.id !== id));

  const addProperty = (property: PropertyFormValues) =>
    setProperties((prev) => [...prev, { ...property, id: crypto.randomUUID() }]);

  const updateProperty = (id: string, property: PropertyFormValues) =>
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...property } : p)));

  const deleteProperty = (id: string) =>
    setProperties((prev) => prev.filter((p) => p.id !== id));

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
        ) : route === '#/property-types' ? (
          <PropertyTypes
            propertyTypes={propertyTypes}
            onAdd={addPropertyType}
            onUpdate={updatePropertyType}
            onDelete={deletePropertyType}
          />
        ) : route === '#/properties' ? (
          <Properties
            properties={properties}
            localities={localities}
            propertyTypes={propertyTypes}
            onAdd={addProperty}
            onUpdate={updateProperty}
            onDelete={deleteProperty}
          />
        ) : (
          <Landlords
            landlords={landlords}
            onAdd={addLandlord}
            onUpdate={updateLandlord}
            onDelete={deleteLandlord}
          />
        )}
      </main>
    </div>
  );
}
