import { useEffect, useMemo, useRef, useState } from 'react';

export interface DateRangePickerRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  id: string;
  name: string;
  from: string;
  to: string;
  onChange: (range: DateRangePickerRange) => void;
  min?: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map((x) => Number(x));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function dateToIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function compareIso(a: string, b: string): number {
  // YYYY-MM-DD compares lexicographically the same as chronological order.
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function monthLabel(date: Date): string {
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

function getGridStart(month: Date): Date {
  // Week starts on Monday.
  const start = startOfMonth(month);
  const day = start.getDay();
  const mondayBased = day === 0 ? 6 : day - 1;
  return addDays(start, -mondayBased);
}

function getGridCells(month: Date): Date[] {
  const gridStart = getGridStart(month);
  const end = endOfMonth(month);
  const gridEndStart = getGridStart(end);
  // Use 6 weeks (42 cells) to keep layout stable.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = gridEndStart;
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export default function DateRangePicker({ id, name, from, to, onChange, min }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const start = isoToDate(from) ?? new Date();
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<DateRangePickerRange | null>(null);

  const inputFromRef = useRef<HTMLInputElement | null>(null);

  const selectedFrom = useMemo(() => isoToDate(from), [from]);
  const selectedTo = useMemo(() => isoToDate(to), [to]);

  useEffect(() => {
    if (!open) return;
    const d = isoToDate(from);
    if (d) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [open, from]);

  const effectiveMinIso = min ?? '';

  const validateRange = (next: DateRangePickerRange): string | null => {
    if (!next.from || !next.to) return null;
    if (compareIso(next.to, next.from) < 0) return 'End date cannot be before start date.';
    return null;
  };

  const commit = (next: DateRangePickerRange) => {
    const err = validateRange(next);
    setLocalError(err);
    if (err) {
      setPendingChange(next);
      // Don’t call onChange until a valid range is committed.
      return;
    }
    setPendingChange(null);
    onChange(next);
  };

  const chooseStart = (date: Date) => {
    const nextFrom = dateToIso(date);
    const next: DateRangePickerRange = { from: nextFrom, to: to || '' };
    setPendingChange(null);
    const err = validateRange(next);
    setLocalError(err);
    onChange(next);
  };

  const chooseEnd = (date: Date) => {
    const nextTo = dateToIso(date);
    const next: DateRangePickerRange = { from: from || '', to: nextTo };
    commit(next);
  };

  const gridCells = useMemo(() => getGridCells(view), [view]);

  const handleNativeSubmitBlocker = () => {
    // Create a real native validation error on the hidden input (focusable).
    const currentError = localError ?? validateRange({ from, to });
    if (!currentError) {
      inputFromRef.current?.setCustomValidity('');
      return true;
    }
    inputFromRef.current?.setCustomValidity(currentError);
    return false;
  };

  const onHiddenInputInvalid: React.InvalidEventHandler<HTMLInputElement> = () => {
    // Ensure we show our inline error too.
    const err = validateRange({ from, to });
    setLocalError(err);
  };

  useEffect(() => {
    // Keep custom validity in sync.
    handleNativeSubmitBlocker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, localError]);

  const minDate = isoToDate(effectiveMinIso);

  const isDisabledByMin = (d: Date) => {
    if (!minDate) return false;
    const minIso = dateToIso(minDate);
    const curIso = dateToIso(d);
    return compareIso(curIso, minIso) < 0;
  };

  const rangeError = localError ?? validateRange({ from, to });

  // One visible interactive control: a single input button opening a popover calendar.
  // The actual onChange writes to both bounds via commit above.
  return (
    <div>
      <input
        ref={inputFromRef}
        type="text"
        id={id}
        name={name}
        value={from && to ? `${from} → ${to}` : from ? `${from} →` : ''}
        readOnly
        required
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        onInvalid={onHiddenInputInvalid}
      />

      <button type="button" className="btn btn-secondary" onClick={() => setOpen((v) => !v)}>
        {from && to ? `Available: ${from} → ${to}` : from ? `Available from: ${from}` : 'Select availability'}
      </button>

      {open && (
        <div className="card" style={{ padding: 12, marginTop: 12 }} role="dialog" aria-label="Availability">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
              ‹
            </button>
            <div style={{ fontWeight: 700 }}>{monthLabel(view)}</div>
            <button type="button" className="btn btn-secondary" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
              ›
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 10 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} style={{ fontSize: 12, color: '#4b5563', fontWeight: 700 }}>{d}</div>
            ))}
            {gridCells.map((d, idx) => {
              const iso = dateToIso(d);
              const inMonth = d.getMonth() === view.getMonth();
              const isDisabled = isDisabledByMin(d);

              const isStart = from && iso === from;
              const isEnd = to && iso === to;
              const isBetween = from && to && compareIso(iso, from) >= 0 && compareIso(iso, to) <= 0;

              const chooseIsStart = !from || (from && to);
              const canClick = !isDisabled;

              return (
                <button
                  key={`${iso}-${idx}`}
                  type="button"
                  disabled={!canClick}
                  onClick={() => {
                    if (!from || (from && to)) {
                      chooseStart(d);
                    } else {
                      chooseEnd(d);
                    }
                    setOpen(false);
                  }}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    background: isStart || isEnd ? '#6d28d9' : isBetween ? '#ede9fe' : inMonth ? '#fff' : '#f3f4f6',
                    color: isStart || isEnd ? '#fff' : '#111827',
                    cursor: !canClick ? 'not-allowed' : 'pointer',
                  }}
                  aria-label={iso}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {rangeError && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{rangeError}</div>}

          {from && to && (
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {rangeError && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{rangeError}</div>}

      {/* Used for form-native blocking; we setCustomValidity in effect. */}
      <input type="submit" style={{ display: 'none' }} />
    </div>
  );
}
