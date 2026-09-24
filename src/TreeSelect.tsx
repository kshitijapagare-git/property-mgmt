export interface TreeSelectOption {
  value: string;
  label: string;
  city: string;
  zone: string;
}

interface TreeSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: TreeSelectOption[];
  placeholder?: string;
  required?: boolean;
}

interface ZoneGroup {
  zone: string;
  options: TreeSelectOption[];
}

interface CityGroup {
  city: string;
  zones: ZoneGroup[];
}

/** Groups a flat list of leaf options into City -> Zone -> [leaves], preserving first-seen order. */
function groupByCityThenZone(options: TreeSelectOption[]): CityGroup[] {
  const cityOrder: string[] = [];
  const cityMap = new Map<string, Map<string, TreeSelectOption[]>>();

  for (const opt of options) {
    if (!cityMap.has(opt.city)) {
      cityMap.set(opt.city, new Map());
      cityOrder.push(opt.city);
    }
    const zoneMap = cityMap.get(opt.city)!;
    if (!zoneMap.has(opt.zone)) zoneMap.set(opt.zone, []);
    zoneMap.get(opt.zone)!.push(opt);
  }

  return cityOrder.map((city) => {
    const zoneMap = cityMap.get(city)!;
    return {
      city,
      zones: Array.from(zoneMap.entries()).map(([zone, opts]) => ({ zone, options: opts })),
    };
  });
}

/**
 * A nested City > Zone > Locality picker. Unlike AsyncSelect, it never hands back a
 * ChangeEvent — clicking a leaf calls `onChange` with that leaf's own value directly,
 * matching the plain-value-callback convention Stepper/Slider/ToggleGroup already use.
 */
export default function TreeSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select a locality',
  required = false,
}: TreeSelectProps) {
  const groups = groupByCityThenZone(options);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="tree-select" id={id}>
      {/* Keeps the field participating in native form validation/`required` without
          reintroducing a <select>'s ChangeEvent-based onChange contract. */}
      <input type="hidden" name={name} value={value} required={required} readOnly />
      {!selected && <div className="tree-select-current">{placeholder}</div>}
      <div className="tree-select-tree" role="tree" aria-label={name}>
        {groups.map((cityGroup) => (
          <details key={cityGroup.city} open>
            <summary>{cityGroup.city}</summary>
            {cityGroup.zones.map((zoneGroup) => (
              <details key={zoneGroup.zone} open>
                <summary>{zoneGroup.zone}</summary>
                <ul>
                  {zoneGroup.options.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="treeitem"
                        aria-selected={value === opt.value}
                        className={`tree-select-leaf ${value === opt.value ? 'selected' : ''}`}
                        onClick={() => onChange(opt.value)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </details>
        ))}
      </div>
    </div>
  );
}
