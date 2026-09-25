import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import AsyncSelect from './AsyncSelect';
import CurrencyInput from './CurrencyInput';
import DateRangePicker from './DateRangePicker';
import MultiSelect from './MultiSelect';
import RichTextEditor from './RichTextEditor';
import type {
  Amenity,
  Column,
  Listing,
  ListingFormValues,
  ListingStatus,
  Property,
  SelectOption,
} from './types';

const PAGE_SIZE = 10;

const amenityOptions: SelectOption[] = [
  { value: 'LIFT', label: 'Lift' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'POWER_BACKUP', label: 'Power backup' },
  { value: 'GYM', label: 'Gym' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'PET_FRIENDLY', label: 'Pet friendly' },
];

const listingStatusOptions: SelectOption[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'LIVE', label: 'Live' },
  { value: 'UNDER_OFFER', label: 'Under offer' },
  { value: 'LET', label: 'Let' },
];

interface ListingsProps {
  listings: Listing[];
  properties: Property[];
  onAdd: (listing: ListingFormValues) => void;
  onUpdate: (id: string, listing: ListingFormValues) => void;
  onDelete: (id: string) => void;
}

const empty: ListingFormValues = {
  propertyId: '',
  expectedRent: 0,
  availableFrom: '',
  availableTo: '',
  description: '',
  amenities: [],
  status: 'DRAFT',
};

export default function Listings({ listings, properties, onAdd, onUpdate, onDelete }: ListingsProps) {
  const [form, setForm] = useState<ListingFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = listings.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const propertyTitle = (id: string) => {
    const p = properties.find((x) => x.id === id);
    return p ? p.title : '';
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setForm({
      propertyId: listing.propertyId,
      expectedRent: listing.expectedRent,
      availableFrom: listing.availableFrom,
      availableTo: listing.availableTo,
      description: listing.description,
      amenities: listing.amenities,
      status: listing.status,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.availableFrom && form.availableTo && form.availableTo < form.availableFrom) return;

    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const handlePropertyIdSelect = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, propertyId: e.target.value });

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, status: e.target.value as ListingStatus });

  const columns: Column<Listing>[] = [
    { key: 'propertyId', header: 'Property', render: (l) => propertyTitle(l.propertyId) },
    { key: 'expectedRent', header: 'Expected rent' },
    {
      key: 'availability',
      header: 'Available',
      render: (l) => `${l.availableFrom} → ${l.availableTo}`,
    },
    { key: 'status', header: 'Status' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Listings</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add listing</button>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(l) => l.id}
          emptyMessage="No listings yet."
          renderActions={(l) => (
            <>
              <button className="btn btn-secondary" onClick={() => openEdit(l)}>Edit</button>{' '}
              <button className="btn btn-danger" onClick={() => onDelete(l.id)}>Delete</button>
            </>
          )}
        />
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit listing' : 'New listing'}
          submitLabel={editingId ? 'Save changes' : 'Add listing'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label htmlFor="propertyId">Property</label>
            <AsyncSelect
              id="propertyId"
              name="propertyId"
              value={form.propertyId}
              onChange={handlePropertyIdSelect}
              options={properties.map((p) => ({ value: p.id, label: p.title }))}
              placeholder="Select a property"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="expectedRent">Expected rent</label>
            <CurrencyInput
              id="expectedRent"
              name="expectedRent"
              value={form.expectedRent}
              onChange={(value) => setForm({ ...form, expectedRent: value })}
            />
          </div>

          <div className="field">
            <label>Availability</label>
            <DateRangePicker
              id="availability"
              name="availability"
              from={form.availableFrom}
              to={form.availableTo}
              onChange={({ from, to }) => setForm({ ...form, availableFrom: from, availableTo: to })}
              min=""
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <RichTextEditor
              id="description"
              name="description"
              value={form.description}
              onChange={(html) => setForm({ ...form, description: html })}
            />
          </div>

          <div className="field">
            <label>Amenities</label>
            <MultiSelect
          id="amenities"
          name="amenities"
          value={form.amenities}
          onChange={(values) => setForm({ ...form, amenities: values as Amenity[] })}
          options={amenityOptions}
            />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <AsyncSelect
              id="status"
              name="status"
              value={form.status}
              onChange={handleStatusChange}
              options={listingStatusOptions}
              placeholder="Select a status"
              required
            />
          </div>
        </Modal>
      )}
    </>
  );
}
