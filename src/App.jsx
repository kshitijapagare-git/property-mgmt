import { useEffect, useState } from 'react';
import Landlords from './Landlords';
import Localities from './Localities';
import { getLandlordDeleteBlockMessage } from './utils/landlordDeleteGuard';

const routes = [
  { path: '#/landlords', label: 'Landlords', icon: '👤' },
  { path: '#/localities', label: 'Localities', icon: '📍' },
];

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/landlords');
  const [landlords, setLandlords] = useState([]);
  const [localities, setLocalities] = useState([]);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/landlords');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const addLandlord = (landlord) =>
    setLandlords((prev) => [...prev, { ...landlord, id: crypto.randomUUID() }]);

  const updateLandlord = (id, landlord) =>
    setLandlords((prev) => prev.map((l) => (l.id === id ? { ...l, ...landlord } : l)));

  const deleteLandlord = (id) => {
    const message = getLandlordDeleteBlockMessage(id, localities);
    if (message) {
      alert(message);
      return;
    }
    setLandlords((prev) => prev.filter((l) => l.id !== id));
  };

  const addLocality = (locality) =>
    setLocalities((prev) => [...prev, { ...locality, id: crypto.randomUUID() }]);

  const updateLocality = (id, locality) =>
    setLocalities((prev) => prev.map((l) => (l.id === id ? { ...l, ...locality } : l)));

  const deleteLocality = (id) =>
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
            onUpdate={updateLocality}
            onDelete={deleteLocality}
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
