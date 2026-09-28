import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import type { DataTableColumn } from './DataTable';
import FormField from './FormField';
import ConfirmDialog from './ConfirmDialog';
import AsyncSelect from './AsyncSelect';
import CurrencyInput from './CurrencyInput';
import { defaultOfferedRentForListing } from './applicationDefaults';
import type {
  Application,
  ApplicationFormValues,
  ApplicationStatus,
  Listing,
  Property,
  Tenant,
  Viewing,
} from './types';

const STATUS_OPTIONS: ApplicationStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED'];

const empty: ApplicationFormValues = {
  viewingId: '',
  tenantId: '',
  offeredRent: 0,
  moveInDate: '',
  notes: '',
  status: 'SUBMITTED',
};

const PAGE_SIZE = 10;

interface ApplicationsProps {
  applications: Application[];
  viewings: Viewing[];
  listings: Listing[];
  properties: Property[];
  tenants: Tenant[];
  onAdd: (application: ApplicationFormValues) => void;
  onUpdate: (id: string, application: ApplicationFormValues) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}

/**
 * Pure predicate: only Viewings with isConfirmed === true are eligible to become an Application,
 * per the acceptance criterion that the viewingId combobox is "sourced only from Viewings where
 * isConfirmed is true". Exported so it can be unit-tested directly, mirroring
 * Listings.tsx's exported isWithinAvailabilityRange pattern.
 */
export function getConfirmedViewings(viewings: Viewing[]): Viewing[] {
  return viewings.filter((v) => v.isConfirmed);
}

/**
 * Pure approval side effect: marks `application` as APPROVED and, resolving
 * application.viewingId -> viewing.listingId, flips only that one Listing's status to
 * UNDER_OFFER in a newly-built listings array — every other listing is returned untouched (same
 * object references). Neither input array/object is mutated. This is the single function this
 * screen's Approve action calls, and the one App.tsx's approveApplication delegates to.
 */
export function applyApproval(
  application: Application,
  viewings: Viewing[],
  listings: Listing[]
): { application: Application; listings: Listing[] } {
  const viewing = viewings.find((v) => v.id === application.viewingId);
  const listingId = viewing?.listingId;

  const updatedApplication: Application = { ...application, status: 'APPROVED' };
  const updatedListings = listings.map((l) =>
    listingId && l.id === listingId ? { ...l, status: 'UNDER_OFFER' as const } : l
  );

  return { application: updatedApplication, listings: updatedListings };
}

export default function Applications({
  applications,
  viewings,
  listings,
  properties,
  tenants,
  onAdd,
  onUpdate,
  onDelete,
  onApprove,
}: ApplicationsProps) {
  const [form, setForm] = useState<ApplicationFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = applications.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const propertyNameForListing = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return 'Unknown property';
    const property = properties.find((p) => p.id === listing.propertyId);
    return property ? property.name : 'Unknown property';
  };

  const propertyNameForViewing = (viewing: Viewing) => propertyNameForListing(viewing.listingId);

  const propertyNameForApplication = (application: Application) => {
    const viewing = viewings.find((v) => v.id === application.viewingId);
    return viewing ? propertyNameForViewing(viewing) : 'Unknown property';
  };

  const tenantName = (tenantId: string) => {
    const t = tenants.find((x) => x.id === tenantId);
    return t ? `${t.firstName} ${t.lastName}` : 'Unknown tenant';
  };

  // AsyncSelect's loadOptions contract is async even though this data is already in memory —
  // wrapping the synchronous filter in a resolved Promise, mirroring Viewings.tsx's
  // loadListingOptions and Localities.tsx's loadLandlordOptions. Restricted to confirmed
  // viewings via getConfirmedViewings, per the acceptance criterion.
  const loadViewingOptions = (query: string): Promise<Viewing[]> => {
    const confirmed = getConfirmedViewings(viewings);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? confirmed.filter(
          (v) =>
            v.prospectName.toLowerCase().includes(q) ||
            propertyNameForViewing(v).toLowerCase().includes(q)
        )
      : confirmed;
    return Promise.resolve(filtered);
  };

  // Sourced from the full live tenant list (no confirmed-only restriction applies here).
  const loadTenantOptions = (query: string): Promise<Tenant[]> => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? tenants.filter(
          (t) =>
            t.firstName.toLowerCase().includes(q) ||
            t.lastName.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q)
        )
      : tenants;
    return Promise.resolve(filtered);
  };

  // Per clarification, tenantId is never auto-filled from the selected viewing — the user always
  // picks it manually.
  const handleTenantChange = (tenantId: string) => setForm({ ...form, tenantId });

  // offeredRent is prefilled from the linked Listing's expectedRent, but only as a one-time copy
  // while creating a brand-new Application (editingId === null). Once an Application exists,
  // reselecting/changing its viewingId must never re-derive offeredRent from the Listing's
  // current value — the saved offeredRent is the only source of truth from then on.
  const handleViewingChange = (viewingId: string) => {
    if (editingId === null) {
      const viewing = viewings.find((v) => v.id === viewingId);
      const listing = viewing ? listings.find((l) => l.id === viewing.listingId) : undefined;
      setForm({ ...form, viewingId, offeredRent: defaultOfferedRentForListing(listing) });
    } else {
      setForm({ ...form, viewingId });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, status: e.target.value as ApplicationStatus });

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

  const openEdit = (application: Application) => {
    const { id, ...values } = application;
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

  const columns: DataTableColumn<Application>[] = [
    { key: 'property', header: 'Property', render: (a) => propertyNameForApplication(a) },
    { key: 'tenant', header: 'Tenant', render: (a) => tenantName(a.tenantId) },
    { key: 'offeredRent', header: 'Offered rent', render: (a) => `₹${a.offeredRent}` },
    { key: 'moveInDate', header: 'Move-in date', render: (a) => a.moveInDate },
    { key: 'status', header: 'Status', render: (a) => a.status },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <>
          <button className="btn btn-secondary" onClick={() => openEdit(a)}>Edit</button>{' '}
          <button className="btn btn-secondary" onClick={() => onApprove(a.id)}>Approve</button>{' '}
          <button className="btn btn-danger" onClick={() => requestDelete(a.id)}>Delete</button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Applications</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New application</button>
      </div>

      <DataTable columns={columns} rows={rows} emptyMessage="No applications yet." />
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit application' : 'New application'}
          submitLabel={editingId ? 'Save application' : 'Add application'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <FormField label="Viewing" htmlFor="viewingId">
            <AsyncSelect
              value={form.viewingId}
              onChange={handleViewingChange}
              loadOptions={loadViewingOptions}
              getId={(v) => v.id}
              getLabel={(v) => `${v.prospectName} — ${propertyNameForViewing(v)}`}
              getSecondary={(v) => `${v.scheduledOn} ${v.slot}`}
            />
          </FormField>
          <FormField label="Tenant" htmlFor="tenantId">
            <AsyncSelect
              value={form.tenantId}
              onChange={handleTenantChange}
              loadOptions={loadTenantOptions}
              getId={(t) => t.id}
              getLabel={(t) => `${t.firstName} ${t.lastName}`}
              getSecondary={(t) => t.email}
            />
          </FormField>
          <FormField label="Offered rent" htmlFor="offeredRent">
            <CurrencyInput
              id="offeredRent"
              name="offeredRent"
              value={form.offeredRent}
              onChange={(value) => setForm({ ...form, offeredRent: value })}
              required
            />
          </FormField>
          <FormField label="Move-in date" htmlFor="moveInDate">
            <input
              id="moveInDate"
              name="moveInDate"
              type="date"
              value={form.moveInDate}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Notes" htmlFor="notes">
            <input
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <select id="status" name="status" value={form.status} onChange={handleStatusChange} required>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
        </Modal>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete application"
          message="Are you sure you want to delete this application?"
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}
