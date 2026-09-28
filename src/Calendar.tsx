import { useMemo } from 'react';
import type { Viewing } from './types';

export interface CalendarProps {
  viewings: Viewing[];
  month: Date;
  onMonthChange: (month: Date) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateKey = (year: number, monthIndex: number, day: number) => {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

/**
 * A minimal month-view calendar: a 7-column grid of the current month's days (with leading blank
 * cells so the first of the month lines up under its weekday), each viewing placed on the cell
 * matching its `scheduledOn` date (compared as a plain "YYYY-MM-DD" prefix, so no timezone
 * conversion is applied). Reads whatever `viewings` array it's given — it never fetches or holds
 * its own copy of the data, so the DataTable/Calendar toggle in Viewings.tsx can switch between
 * the two views without a second data source.
 */
export default function Calendar({ viewings, month, onMonthChange }: CalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const viewingsByDay = useMemo(() => {
    const map = new Map<string, Viewing[]>();
    for (const v of viewings) {
      const key = v.scheduledOn.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return map;
  }, [viewings]);

  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const cells: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, key: toDateKey(year, monthIndex, day) });
  }

  const goToPreviousMonth = () => onMonthChange(new Date(year, monthIndex - 1, 1));
  const goToNextMonth = () => onMonthChange(new Date(year, monthIndex + 1, 1));

  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="btn btn-secondary" onClick={goToPreviousMonth}>‹ Prev</button>
        <div className="calendar-month-label">{monthLabel}</div>
        <button type="button" className="btn btn-secondary" onClick={goToNextMonth}>Next ›</button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar-weekday">{label}</div>
        ))}
      </div>
      <div className="calendar-grid calendar-days">
        {cells.map((cell, index) =>
          cell === null ? (
            <div key={`blank-${index}`} className="calendar-day calendar-day-empty" />
          ) : (
            <div
              key={cell.key}
              className={`calendar-day ${cell.key === todayKey ? 'calendar-day-today' : ''}`}
            >
              <div className="calendar-day-number">{cell.day}</div>
              <div className="calendar-day-viewings">
                {(viewingsByDay.get(cell.key) ?? []).map((v) => (
                  <div key={v.id} className="calendar-viewing">
                    {v.slot ? `${v.slot} — ` : ''}{v.prospectName}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
