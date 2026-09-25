import { useEffect, useState } from 'react';
import Landlords from './Landlords';
import Localities from './Localities';
import type { Landlord, LandlordFormValues, Locality, LocalityFormValues } from './types';

const routes = [
  { path: '#/landlords', label: 'Landlords', icon: '👤' },
  { path: '#/localities', label: 'Localities', icon: '📍' },
];

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/landlords');
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);

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
        ) : (
          <Landlords landlords={landlords} onAdd={addLandlord} onDelete={deleteLandlord} />
        )}
      </main>
    </div>
  );
}
