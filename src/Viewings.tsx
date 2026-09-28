import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import DataTable from './DataTable';
import type { DataTableColumn } from './DataTable';
import FormField from './FormField';
import AsyncSelect from './AsyncSelect';
import PhoneInput from './PhoneInput';
import TimePicker from './TimePicker';
import Switch from './Switch';
import Calendar from './Calendar';
import type { Listing, Property, Viewing, ViewingFormValues } from './types';

const empty: ViewingFormValues = {
  listingId: '',
  prospectName: '',
  phone: '',
  scheduledOn: '',
  slot: '',
  isConfirmed: false,
};

type ViewMode = 'table' | 'calendar';

interface ViewingsProps {
  viewings: Viewing[];
  listings: Listing[];
  properties: Property[];
  onAdd: (viewing: ViewingFormValues) => void;
  onUpdate: (id: string, viewing: ViewingFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Viewings({ viewings, listings, properties, onAdd, onUpdate, onDelete }: ViewingsProps) {
  const [form, setForm] = useState<ViewingFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleListingChange = (listingId: string) => setForm({ ...form, listingId });

  const propertyNameForListing = (listing: Listing) =>
    properties.find((p) => p.id === listing.propertyId)?.name ?? 'Unknown property';

  const listingLabel = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    return listing ? `${propertyNameForListing(listing)} — ₹${listing.expectedRent}` : 'Unknown listing';
  };

  // AsyncSelect's loadOptions contract is async even though this data is already in memory —
  // wrapping the synchronous filter in a resolved Promise keeps this reusable once listings come
  // from a real API. Filters by property name and description substring so the combobox stays
  // usable over a large list without ever rendering it all at once.
  const loadListingOptions = (query: string): Promise<Listing[]> => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? listings.filter(
          (l) =>
            propertyNameForListing(l).toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
        )
      : listings;
    return Promise.resolve(filtered);
  };

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

  const openEdit = (viewing: Viewing) => {
    const { id, ...values } = viewing;
    setForm(values);
    setEditingId(id);
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const columns: DataTableColumn<Viewing>[] = [
    { key: 'listingId', header: 'Listing', render: (v) => listingLabel(v.listingId) },
    { key: 'prospectName', header: 'Prospect', render: (v) => v.prospectName },
    { key: 'phone', header: 'Phone', render: (v) => v.phone },
    { key: 'scheduledOn', header: 'Scheduled on', render: (v) => v.scheduledOn },
    { key: 'slot', header: 'Slot', render: (v) => v.slot },
    { key: 'isConfirmed', header: 'Confirmed', render: (v) => (v.isConfirmed ? 'Yes' : 'No') },
    {
      key: 'actions',
      header: 'Actions',
      render: (v) => (
        <>
          <button className="btn btn-secondary" onClick={() => openEdit(v)}>Edit</button>{' '}
          <button className="btn btn-danger" onClick={() => requestDelete(v.id)}>Delete</button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Viewings</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Schedule viewing</button>
      </div>

      <div className="view-toggle">
        <button
          type="button"
          className={`view-toggle-option ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
        >
          Table
        </button>
        <button
          type="button"
          className={`view-toggle-option ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          Calendar
        </button>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} rows={viewings} emptyMessage="No viewings scheduled yet." />
      ) : (
        <Calendar viewings={viewings} month={calendarMonth} onMonthChange={setCalendarMonth} />
      )}

      {open && (
        <Modal
          title={editingId ? 'Edit viewing' : 'Schedule viewing'}
          submitLabel={editingId ? 'Save viewing' : 'Schedule viewing'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <FormField label="Listing" htmlFor="listingId">
            <AsyncSelect
              value={form.listingId}
              onChange={handleListingChange}
              loadOptions={loadListingOptions}
              getId={(l) => l.id}
              getLabel={(l) => `${propertyNameForListing(l)} — ₹${l.expectedRent}`}
              getSecondary={(l) => `${l.status} • from ${l.availableFrom}`}
            />
          </FormField>
          <FormField label="Prospect name" htmlFor="prospectName">
            <input
              id="prospectName"
              name="prospectName"
              value={form.prospectName}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <PhoneInput
              id="phone"
              name="phone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              required
            />
          </FormField>
          <FormField label="Scheduled on" htmlFor="scheduledOn">
            <input
              id="scheduledOn"
              name="scheduledOn"
              type="date"
              value={form.scheduledOn}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Slot" htmlFor="slot">
            <TimePicker
              id="slot"
              name="slot"
              value={form.slot}
              onChange={(value) => setForm({ ...form, slot: value })}
            />
          </FormField>
          <FormField label="Confirmed" htmlFor="isConfirmed">
            <Switch
              checked={form.isConfirmed}
              onChange={(checked) => setForm({ ...form, isConfirmed: checked })}
            />
          </FormField>
        </Modal>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete viewing"
          message="Are you sure you want to delete this viewing?"
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}
