import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import CurrencyInput from './CurrencyInput';
import DateRangePicker from './DateRangePicker';
import RichTextEditor from './RichTextEditor';
import MultiSelect from './MultiSelect';
import type { Amenity, Listing, ListingFormValues, ListingStatus, Property } from './types';

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

const PAGE_SIZE = 10;

interface ListingsProps {
  listings: Listing[];
  properties: Property[];
  propertiesLoading: boolean;
  onAdd: (listing: ListingFormValues) => void;
  onUpdate: (id: string, listing: ListingFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Listings({
  listings,
  properties,
  propertiesLoading,
  onAdd,
  onUpdate,
  onDelete,
}: ListingsProps) {
  const [form, setForm] = useState<ListingFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = listings.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

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

  return (
    <>
      <div className="page-header">
        <h1>Listings</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add listing</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Expected rent</th>
              <th>Available from</th>
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
