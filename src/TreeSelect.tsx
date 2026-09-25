import { useEffect, useMemo, useState } from 'react';
import type { Locality } from './types';

interface TreeSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (localityId: string) => void;
  localities: Locality[];
  placeholder?: string;
  required?: boolean;
}

type CityNode = {
  city: string;
  zones: {
    zone: string;
    localities: Locality[];
  }[];
};

function normalizeZone(zone: string): string {
  const z = zone.trim();
  return z.length === 0 ? 'Unassigned' : z;
}

export default function TreeSelect({
  id,
  name,
  value,
  onChange,
  localities,
  placeholder = 'Select a locality',
  required = false,
}: TreeSelectProps) {
  const [activeCity, setActiveCity] = useState<string>('');
  const [activeZone, setActiveZone] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const selected = useMemo(() => localities.find((l) => l.id === value) ?? null, [localities, value]);

  const tree: CityNode[] = useMemo(() => {
    const byCity = new Map<string, Map<string, Locality[]>>();
    for (const l of localities) {
      const city = l.city;
      const zone = normalizeZone(l.zone);
      if (!byCity.has(city)) byCity.set(city, new Map());
      const byZone = byCity.get(city)!;
      if (!byZone.has(zone)) byZone.set(zone, []);
      byZone.get(zone)!.push(l);
    }

    return Array.from(byCity.entries())
      .map(([city, zones]) => ({
        city,
        zones: Array.from(zones.entries()).map(([zone, localities]) => ({ zone, localities })),
      }))
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [localities]);

  useEffect(() => {
    if (!selected) return;
    setActiveCity(selected.city);
    setActiveZone(normalizeZone(selected.zone));
  }, [selected]);

  const activeCityNode = tree.find((n) => n.city === activeCity) ?? null;
  const activeZoneNode = activeCityNode?.zones.find((z) => z.zone === activeZone) ?? null;

  const invalid = required && touched && value.length === 0;

  const handleSubmitBlock = () => {
    if (!required) return;
    if (value.length === 0) {
      setTouched(true);
    }
  };

  return (
    <div className="tree-select" id={id}>
      {/* Not type="hidden" or readOnly: both are skipped by native validation, so `required`
          would never block submit. Visually hidden instead, and kept out of the tab order. */}
      <input
        type="text"
        name={name}
        value={value}
        onChange={() => {}}
        required={required}
        onInvalid={handleSubmitBlock}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
          {placeholder}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 180 }}>
            <div style={{ marginBottom: 6, fontSize: 12, color: '#4b5563', textTransform: 'uppercase' }}>City</div>
            <select
              value={activeCity}
              onChange={(e) => {
                setActiveCity(e.target.value);
                setActiveZone('');
              }}
            >
              <option value="">-- Select city --</option>
              {tree.map((n) => (
                <option key={n.city} value={n.city}>
                  {n.city}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 180 }}>
            <div style={{ marginBottom: 6, fontSize: 12, color: '#4b5563', textTransform: 'uppercase' }}>Zone</div>
            <select value={activeZone} onChange={(e) => setActiveZone(e.target.value)} disabled={!activeCityNode}>
              <option value="">-- Select zone --</option>
              {activeCityNode?.zones.map((z) => (
                <option key={z.zone} value={z.zone}>
                  {z.zone}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ marginBottom: 6, fontSize: 12, color: '#4b5563', textTransform: 'uppercase' }}>Locality</div>
            <select
              value={value}
              onChange={(e) => {
                setTouched(true);
                onChange(e.target.value);
              }}
              onBlur={() => setTouched(true)}
              disabled={!activeZoneNode}
            >
              <option value="">-- Select locality --</option>
              {activeZoneNode?.localities.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.pincode})
                </option>
              ))}
            </select>

            {invalid && (
              <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>
                {placeholder} is required.
              </div>
            )}

            {selected && (
              <div style={{ color: '#374151', fontSize: 13, marginTop: 8 }}>
                Selected: {selected.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
