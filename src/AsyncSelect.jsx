export default function AsyncSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  isLoading = false,
  required = false,
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={isLoading}
    >
      {isLoading ? (
        <option value="" disabled>Loading...</option>
      ) : (
        <>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </>
      )}
    </select>
  );
}
