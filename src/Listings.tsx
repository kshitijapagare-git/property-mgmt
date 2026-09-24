import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import AsyncSelect from './AsyncSelect';
import CurrencyInput from './CurrencyInput';
import DateRangePicker from './DateRangePicker';
import RichTextEditor from './RichTextEditor';
import MultiSelect from './MultiSelect';
import { validateDateRange } from './utils/dateRangeGuard';
import type {
  Amenity,
  Column,
  Listing,
  ListingFormValues,
  ListingStatus,
  Property,
  SelectOption,
} from './types';

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

const statusOptions: SelectOption[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'LIVE', label: 'Live' },
  { value: 'UNDER_OFFER', label: 'Under offer' },
  { value: 'LET', label: 'Let' },
];

const amenityOptions: SelectOption[] = [
  { value: 'LIFT', label: 'Lift' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'POWER_BACKUP', label: 'Power backup' },
  { value: 'GYM', label: 'Gym' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'PET_FRIENDLY', label: 'Pet friendly' },
];

interface ListingsProps {
  listings: Listing[];
  properties: Property[];
  onAdd: (listing: ListingFormValues) => void;
  onUpdate: (id: string, listing: ListingFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Listings({
  listings,
  properties,
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

  const handlePropertyChange = (value: string) => setForm({ ...form, propertyId: value });

  const handleExpectedRentChange = (value: number) => setForm({ ...form, expectedRent: value });

  const handleAvailableFromChange = (value: string) => setForm({ ...form, availableFrom: value });

  const handleAvailableToChange = (value: string) => setForm({ ...form, availableTo: value });

  const handleDescriptionChange = (value: string) => setForm({ ...form, description: value });

  const handleAmenitiesChange = (value: string[]) =>
    setForm({ ...form, amenities: value as Amenity[] });

  const handleStatusChange = (value: string) =>
    setForm({ ...form, status: value as ListingStatus });

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateDateRange(form.availableFrom, form.availableTo)) return;
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const propertyTitle = (id: string) => {
    const p = properties.find((x) => x.id === id);
    return p ? p.title : '';
  };

  const columns: Column<Listing>[] = [
    { key: 'property', header: 'Property', render: (l) => propertyTitle(l.propertyId) },
    { key: 'expectedRent', header: 'Expected rent' },
    { key: 'availableFrom', header: 'Available from' },
    { key: 'availableTo', header: 'Available to' },
    { key: 'amenities', header: 'Amenities', render: (l) => l.amenities.join(', ') },
    { key: 'status', header: 'Status' },
  ];

  const propertyOptions: SelectOption[] = properties.map((p) => ({
    value: p.id,
    label: p.title,
  }));

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
              onChange={(e) => handlePropertyChange(e.target.value)}
              options={propertyOptions}
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
              onChange={handleExpectedRentChange}
            />
          </div>
          <div className="field">
            <label htmlFor="availability">Availability</label>
            <DateRangePicker
              id="availability"
              name="availability"
              valueFrom={form.availableFrom}
              valueTo={form.availableTo}
              onChangeFrom={handleAvailableFromChange}
              onChangeTo={handleAvailableToChange}
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <RichTextEditor
              id="description"
              name="description"
              value={form.description}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="field">
            <label htmlFor="amenities">Amenities</label>
            <MultiSelect
              id="amenities"
              name="amenities"
              value={form.amenities}
              onChange={handleAmenitiesChange}
              options={amenityOptions}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <AsyncSelect
              id="status"
              name="status"
              value={form.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={statusOptions}
              placeholder="Select a status"
              required
            />
          </div>
        </Modal>
      )}
    </>
  );
}
