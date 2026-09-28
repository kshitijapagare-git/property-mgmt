import { useMemo, useState } from 'react';
import type { Locality } from './types';

interface TreeSelectProps {
  localities: Locality[];
  value: string;
  onChange: (localityId: string) => void;
}

interface ZoneGroup {
  zone: string;
  localities: Locality[];
}

interface CityGroup {
  city: string;
  zones: ZoneGroup[];
}

/**
 * A single control grouping localities by City → Zone → Locality. Selecting a leaf calls
 * `onChange` with that locality's `id` — never a city or zone identifier. If `value` doesn't
 * match any locality currently in `localities` (e.g. it was deleted), the current selection is
 * rendered as "Unknown locality" without altering `value`, and the tree stays usable so the user
 * can reselect.
 */
export default function TreeSelect({ localities, value, onChange }: TreeSelectProps) {
  const [open, setOpen] = useState(false);

  const tree = useMemo<CityGroup[]>(() => {
    const cityMap = new Map<string, Map<string, Locality[]>>();
    for (const loc of localities) {
      if (!cityMap.has(loc.city)) cityMap.set(loc.city, new Map());
      const zoneMap = cityMap.get(loc.city)!;
      if (!zoneMap.has(loc.zone)) zoneMap.set(loc.zone, []);
      zoneMap.get(loc.zone)!.push(loc);
    }
    return Array.from(cityMap.entries()).map(([city, zoneMap]) => ({
      city,
      zones: Array.from(zoneMap.entries()).map(([zone, locs]) => ({ zone, localities: locs })),
    }));
  }, [localities]);

  const selected = localities.find((l) => l.id === value);
  const label = !value ? 'Select a locality' : selected ? selected.name : 'Unknown locality';
  // When `value` doesn't match any locality currently in `localities` (e.g. it was deleted), the
  // tree stays open for reselection regardless of the toggle state, instead of requiring an
  // extra click to open it.
  const isUnknown = Boolean(value) && !selected;
  const effectiveOpen = open || isUnknown;

  const handleSelect = (localityId: string) => {
    onChange(localityId);
    setOpen(false);
  };

  return (
    <div className="tree-select" onClick={() => setOpen((o) => !o)}>
      <button type="button" className="tree-select-toggle">
        {label}
      </button>
      {effectiveOpen && (
        <div className="tree-select-dropdown">
          {tree.length === 0 ? (
            <div className="tree-node empty">No localities yet.</div>
          ) : (
            tree.map((cityGroup) => (
              <div key={cityGroup.city} className="tree-city">
                <div className="tree-node tree-city-label">{cityGroup.city}</div>
                {cityGroup.zones.map((zoneGroup) => (
                  <div key={zoneGroup.zone} className="tree-zone">
                    <div className="tree-node tree-zone-label">{zoneGroup.zone}</div>
                    {zoneGroup.localities.map((loc) => (
                      <div
                        key={loc.id}
                        className={`tree-node tree-leaf ${loc.id === value ? 'selected' : ''}`}
                        onClick={() => handleSelect(loc.id)}
                      >
                        {loc.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
