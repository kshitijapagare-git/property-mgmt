import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import CurrencyInput from './CurrencyInput';
import DateRangePicker from './DateRangePicker';
import RichTextEditor from './RichTextEditor';
import MultiSelect from './MultiSelect';
import RangeSlider from './RangeSlider';
import type { Amenity, Listing, ListingFormValues, ListingStatus, Property, PropertyType } from './types';

const AMENITY_OPTIONS: Amenity[] = ['LIFT', 'PARKING', 'POWER_BACKUP', 'GYM', 'SECURITY', 'PET_FRIENDLY'];
const STATUS_OPTIONS: ListingStatus[] = ['DRAFT', 'LIVE', 'UNDER_OFFER', 'LET'];

const empty: ListingFormValues = {
  propertyId: '',
  expectedRent: 0,
  availableFrom: '',
  availableTo: '',
  description: '',
  amenities: [],
  status: 'DRAFT',
};

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

type SortKey = 'expectedRent' | 'availableFrom';

interface AvailabilityRange {
  start: string;
  end: string;
}

const emptyAvailabilityRange: AvailabilityRange = { start: '', end: '' };

interface ListingsProps {
  listings: Listing[];
  properties: Property[];
  propertyTypes: PropertyType[];
  propertiesLoading: boolean;
  onAdd: (listing: ListingFormValues) => void;
  onUpdate: (id: string, listing: ListingFormValues) => void;
  onDelete: (id: string) => void;
}

/**
 * Pure predicate: does `availableFrom` fall within [start, end] inclusive? Per clarification,
 * Listing only has a single `availableFrom` date (no availableTo used for filtering purposes
 * here), so "overlap" means the date itself lies in the selected range. Either bound left blank
 * is treated as unbounded on that side. Exported so it can be unit-tested directly.
 */
export function isWithinAvailabilityRange(availableFrom: string, range: AvailabilityRange): boolean {
  if (range.start && availableFrom < range.start) return false;
  if (range.end && availableFrom > range.end) return false;
  return true;
}

export default function Listings({
  listings,
  properties,
  propertyTypes,
  propertiesLoading,
  onAdd,
  onUpdate,
  onDelete,
}: ListingsProps) {
  const [form, setForm] = useState<ListingFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Full-text search, debounced 400ms — `searchQuery` tracks every keystroke immediately (so
  // the input stays responsive), while `debouncedQuery` only updates after the user pauses, and
  // it is `debouncedQuery` that ever reaches the filter pipeline below.
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const rentBounds = useMemo<[number, number]>(() => {
    if (listings.length === 0) return [0, 0];
    const values = listings.map((l) => l.expectedRent);
    return [Math.min(...values), Math.max(...values)];
  }, [listings]);

  const [rentRange, setRentRange] = useState<[number, number]>(rentBounds);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [availabilityRange, setAvailabilityRange] = useState<AvailabilityRange>(emptyAvailabilityRange);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Keep the slider's selection anchored to the live data's bounds whenever the underlying
  // listings change (e.g. a listing is added/edited/deleted), rather than freezing on whatever
  // bounds existed on first render.
  useEffect(() => {
    setRentRange(rentBounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentBounds[0], rentBounds[1]]);

  useEffect(() => {
    if (searchQuery === debouncedQuery) return;
    setSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // One composed pipeline: search -> rent range -> status -> propertyType -> availability ->
  // sort. Pagination (below) slices this result, never the raw `listings` prop, so filters/sort
  // and paging compose instead of each independently re-filtering the source list.
  const visibleListings = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let result = listings.filter((l) => {
      if (q && !l.description.toLowerCase().includes(q)) return false;
      if (l.expectedRent < rentRange[0] || l.expectedRent > rentRange[1]) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      if (propertyTypeFilter) {
        const property = properties.find((p) => p.id === l.propertyId);
        if (!property || property.propertyTypeId !== propertyTypeFilter) return false;
      }
      if (!isWithinAvailabilityRange(l.availableFrom, availabilityRange)) return false;
      return true;
    });

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const diff = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
        return sortDirection === 'asc' ? diff : -diff;
      });
    }

    return result;
  }, [listings, properties, debouncedQuery, rentRange, statusFilter, propertyTypeFilter, availabilityRange, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleListings.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = visibleListings.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const resetToFirstPage = () => setPage(1);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    resetToFirstPage();
  };

  const handleRentRangeChange = (min: number, max: number) => {
    setRentRange([min, max]);
    resetToFirstPage();
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ListingStatus | '');
    resetToFirstPage();
  };

  const handlePropertyTypeFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPropertyTypeFilter(e.target.value);
    resetToFirstPage();
  };

  const handleAvailabilityRangeChange = (start: string, end: string) => {
    setAvailabilityRange({ start, end });
    resetToFirstPage();
  };

  const handleSortClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    resetToFirstPage();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearching(false);
    setRentRange(rentBounds);
    setStatusFilter('');
    setPropertyTypeFilter('');
    setAvailabilityRange(emptyAvailabilityRange);
    setSortKey(null);
    setSortDirection('asc');
    setPage(1);
  };

  // ListingFormValues mixes string, number, union and array fields, so — unlike the
  // Landlord/Locality forms where every field is a string — a single generic `[name]: value`
  // handler can't type-check across all of them. Each <select> gets its own narrow setter.
  const handlePropertyChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, propertyId: e.target.value });

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, status: e.target.value as ListingStatus });

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
  };

  const openCreate = () => {
    setForm(empty);
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (listing: Listing) => {
    const { id, ...values } = listing;
    setForm(values);
    setEditingId(id);
    setOpen(true);
  };

  const noProperties = !propertiesLoading && properties.length === 0;
  const propertySectionDisabled = propertiesLoading || noProperties;
  // DateRangePicker only renders an inline error when availableTo is before availableFrom; it
  // never blocks submission itself, so the consuming form must check this before submitting.
  const dateRangeInvalid = Boolean(
    form.availableFrom && form.availableTo && form.availableTo < form.availableFrom
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Guard against submitting while the property list hasn't loaded, or has loaded empty —
    // the propertyId select has nothing valid to submit either way. Also guard against an
    // invalid availability range, since DateRangePicker itself only shows an inline error.
    if (propertySectionDisabled || dateRangeInvalid) return;
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const propertyName = (id: string) => {
    const p = properties.find((x) => x.id === id);
    return p ? p.name : '';
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const sortHeaderClass = (key: SortKey) => {
    if (sortKey !== key) return 'sortable-header';
    return `sortable-header ${sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc'}`;
  };

  return (
    <>
      <div className="page-header">
        <h1>Listings</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add listing</button>
      </div>

      <div className="card listing-filters">
        <div className="field">
          <label htmlFor="listing-search">Search description</label>
          <input
            id="listing-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search…"
          />
        </div>
        <div className="field">
          <label>Expected rent</label>
          <RangeSlider min={rentBounds[0]} max={rentBounds[1]} value={rentRange} onChange={handleRentRangeChange} />
        </div>
        <div className="field">
          <label>Available from</label>
          <DateRangePicker
            startName="availabilityStart"
            endName="availabilityEnd"
            startValue={availabilityRange.start}
            endValue={availabilityRange.end}
            onChange={handleAvailabilityRangeChange}
          />
        </div>
        <div className="field">
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="property-type-filter">Property type</label>
          <select id="property-type-filter" value={propertyTypeFilter} onChange={handlePropertyTypeFilterChange}>
            <option value="">All property types</option>
            {propertyTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>

      {searching && (
        <div className="spinner" role="status" aria-live="polite">Searching…</div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th
                className={sortHeaderClass('expectedRent')}
                onClick={() => handleSortClick('expectedRent')}
              >
                Expected rent{sortIndicator('expectedRent')}
              </th>
              <th
                className={sortHeaderClass('availableFrom')}
                onClick={() => handleSortClick('availableFrom')}
              >
                Available from{sortIndicator('availableFrom')}
              </th>
              <th>Available to</th>
              <th>Status</th>
              <th>Amenities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="empty">No listings yet.</td></tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id}>
                  <td>{propertyName(l.propertyId)}</td>
                  <td>{l.expectedRent}</td>
                  <td>{l.availableFrom}</td>
                  <td>{l.availableTo}</td>
                  <td>{l.status}</td>
                  <td>{l.amenities.join(', ')}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => openEdit(l)}>Edit</button>{' '}
                    <button className="btn btn-danger" onClick={() => onDelete(l.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit listing' : 'New listing'}
          submitLabel={editingId ? 'Save listing' : 'Add listing'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label htmlFor="propertyId">Property</label>
            {propertiesLoading && (
              <div className="spinner" role="status" aria-live="polite">Loading properties…</div>
            )}
            {noProperties && <p className="empty">No properties found</p>}
            <select
              id="propertyId"
              name="propertyId"
              value={form.propertyId}
              onChange={handlePropertyChange}
              required
              disabled={propertySectionDisabled}
            >
              <option value="">Select a property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <fieldset disabled={propertySectionDisabled} className="listing-fieldset">
            <div className="field">
              <label htmlFor="expectedRent">Expected rent</label>
              <CurrencyInput
                id="expectedRent"
                name="expectedRent"
                value={form.expectedRent}
                onChange={(value) => setForm({ ...form, expectedRent: value })}
                required
              />
            </div>
            <div className="field">
              <label>Availability</label>
              <DateRangePicker
                startName="availableFrom"
                endName="availableTo"
                startValue={form.availableFrom}
                endValue={form.availableTo}
                onChange={(start, end) => setForm({ ...form, availableFrom: start, availableTo: end })}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
              />
            </div>
            <div className="field">
              <label>Amenities</label>
              <MultiSelect
                options={AMENITY_OPTIONS}
                selected={form.amenities}
                onChange={(amenities) => setForm({ ...form, amenities })}
              />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleStatusChange} required>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </fieldset>
        </Modal>
      )}
    </>
  );
}
