import type { Amenity } from './types';

interface MultiSelectProps {
  options: Amenity[];
  selected: Amenity[];
  onChange: (value: Amenity[]) => void;
}

const LABELS: Record<Amenity, string> = {
  LIFT: 'Lift',
  PARKING: 'Parking',
  POWER_BACKUP: 'Power backup',
  GYM: 'Gym',
  SECURITY: 'Security',
  PET_FRIENDLY: 'Pet friendly',
};

/**
 * A togglable multi-select over a fixed set of amenity options. Toggling every option off is a
 * valid, accepted state — it submits an empty array rather than being blocked or defaulted.
 */
export default function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const toggle = (option: Amenity) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="multiselect">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            type="button"
            key={option}
            className={`multiselect-option ${isSelected ? 'selected' : ''}`}
            onClick={() => toggle(option)}
            aria-pressed={isSelected}
          >
            {LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
