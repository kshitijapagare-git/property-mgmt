interface StarRatingProps {
  id: string;
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
}

export default function StarRating({
  id,
  name,
  value,
  onChange,
  max = 5,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const handleClick = (star: number) => {
    // Clicking the currently-selected star clears it back to unrated (null), not 0 — a
    // rating of 0 would be indistinguishable from a real (if minimal) rating.
    if (value === star) {
      onChange(null);
    } else {
      onChange(star);
    }
  };

  return (
    <div className="star-rating" id={id} role="radiogroup" aria-label={name}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={`star ${value !== null && value >= star ? 'filled' : ''}`}
          onClick={() => handleClick(star)}
        >
          ★
        </button>
      ))}
      {value !== null && (
        <button type="button" className="star-clear" aria-label="Clear rating" onClick={() => onChange(null)}>
          Clear
        </button>
      )}
    </div>
  );
}
