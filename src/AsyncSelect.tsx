import { useEffect, useRef, useState } from 'react';

export interface AsyncSelectProps<T> {
  value: string;
  onChange: (id: string) => void;
  loadOptions: (query: string) => Promise<T[]>;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  getSecondary?: (item: T) => string;
  placeholder?: string;
}

const DEBOUNCE_MS = 200;

/**
 * Generic async-Select primitive: type into the input to filter options via `loadOptions`
 * (debounced), pick a leaf to call `onChange` with its id. Establishes the pattern every later
 * ticket is told to reuse — nothing here is specific to Landlord, though the Locality form
 * configures it with Landlord-shaped data (firstName/lastName/email substring filter, label
 * "firstName lastName" with email as a secondary line).
 *
 * `loadOptions`/`getId`/`getLabel` are read through refs updated on every render rather than
 * listed as effect dependencies — callers typically pass fresh inline closures each render, and
 * depending on those directly would refetch on every parent re-render instead of only when the
 * user types or the selected `value` changes.
 */
export default function AsyncSelect<T>({
  value,
  onChange,
  loadOptions,
  getId,
  getLabel,
  getSecondary,
  placeholder = 'Select…',
}: AsyncSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);

  const loadOptionsRef = useRef(loadOptions);
  const getIdRef = useRef(getId);
  const getLabelRef = useRef(getLabel);
  const getSecondaryRef = useRef(getSecondary);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadOptionsRef.current = loadOptions;
    getIdRef.current = getId;
    getLabelRef.current = getLabel;
    getSecondaryRef.current = getSecondary;
  });

  // Resolve the currently selected item's label independent of whether the dropdown has ever
  // been opened, so the closed toggle can show "firstName lastName" rather than the raw id.
  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    let cancelled = false;
    loadOptionsRef.current('').then((items) => {
      if (cancelled) return;
      const match = items.find((item) => getIdRef.current(item) === value);
      setSelected(match ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const requestId = ++requestIdRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadOptionsRef.current(query).then((items) => {
        if (requestIdRef.current !== requestId) return;
        const q = query.trim().toLowerCase();
        const filtered = q
          ? items.filter((item) => {
              const label = getLabelRef.current(item).toLowerCase();
              const secondary = getSecondaryRef.current?.(item)?.toLowerCase() ?? '';
              return label.includes(q) || secondary.includes(q);
            })
          : items;
        setOptions(filtered);
        setLoading(false);
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, query]);

  const handleToggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) setQuery('');
      return next;
    });
  };

  const handleSelect = (item: T) => {
    onChange(getId(item));
    setSelected(item);
    setOpen(false);
    setQuery('');
  };

  const label = selected ? getLabel(selected) : value ? 'Unknown' : placeholder;

  return (
    <div className="async-select">
      <button type="button" className="async-select-toggle" onClick={handleToggle}>
        {label}
      </button>
      {open && (
        <div className="async-select-dropdown">
          <input
            type="text"
            className="async-select-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            autoFocus
          />
          {loading ? (
            <div className="spinner" role="status" aria-live="polite">Loading…</div>
          ) : options.length === 0 ? (
            <div className="async-select-empty">No results</div>
          ) : (
            options.map((item) => (
              <div
                key={getId(item)}
                className={`async-select-option ${getId(item) === value ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <div className="async-select-option-label">{getLabel(item)}</div>
                {getSecondary && (
                  <div className="async-select-option-secondary">{getSecondary(item)}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
