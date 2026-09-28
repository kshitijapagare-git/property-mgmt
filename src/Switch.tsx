export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * A boolean toggle used for the Viewing form's `isConfirmed` field, with a visibly distinct
 * on/off state (see the `.switch.on`/`.switch.off` rules in index.css) rather than a plain
 * checkbox.
 */
export default function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`switch ${checked ? 'on' : 'off'}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-knob" />
    </button>
  );
}
