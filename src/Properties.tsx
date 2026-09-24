import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import AsyncSelect from './AsyncSelect';
import TreeSelect from './TreeSelect';
import type { TreeSelectOption } from './TreeSelect';
import Stepper from './Stepper';
import Slider from './Slider';
import ToggleGroup from './ToggleGroup';
import StarRating from './StarRating';
import DatePicker from './DatePicker';
import type {
  Column,
  Furnishing,
  Locality,
  Property,
  PropertyFormValues,
  PropertyType,
  SelectOption,
} from './types';

const empty: PropertyFormValues = {
  title: '',
  localityId: '',
  propertyTypeId: '',
  bedrooms: 0,
  bathrooms: 0,
  carpetAreaSqft: 150,
  furnishing: 'UNFURNISHED',
  conditionRating: null,
  builtOn: '',
};
const PAGE_SIZE = 10;

const furnishingOptions: SelectOption[] = [
  { value: 'UNFURNISHED', label: 'Unfurnished' },
  { value: 'SEMI', label: 'Semi-furnished' },
  { value: 'FULL', label: 'Fully furnished' },
];

interface PropertiesProps {
  properties: Property[];
  localities: Locality[];
  propertyTypes: PropertyType[];
  onAdd: (property: PropertyFormValues) => void;
  onUpdate: (id: string, property: PropertyFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Properties({
  properties,
  localities,
  propertyTypes,
  onAdd,
  onUpdate,
  onDelete,
}: PropertiesProps) {
  const [form, setForm] = useState<PropertyFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = properties.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, title: e.target.value });

  const handleLocalityChange = (value: string) => setForm({ ...form, localityId: value });

  const handlePropertyTypeChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, propertyTypeId: e.target.value });

  const handleBedroomsChange = (value: number) => setForm({ ...form, bedrooms: value });

  const handleBathroomsChange = (value: number) => setForm({ ...form, bathrooms: value });

  const handleCarpetAreaChange = (value: number) => setForm({ ...form, carpetAreaSqft: value });

  const handleFurnishingChange = (value: string) =>
    setForm({ ...form, furnishing: value as Furnishing });

  const handleConditionRatingChange = (value: number | null) =>
    setForm({ ...form, conditionRating: value });

  const handleBuiltOnChange = (value: string) => setForm({ ...form, builtOn: value });

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

  const openEdit = (property: Property) => {
    setEditingId(property.id);
    setForm({
      title: property.title,
      localityId: property.localityId,
      propertyTypeId: property.propertyTypeId,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      carpetAreaSqft: property.carpetAreaSqft,
      furnishing: property.furnishing,
      conditionRating: property.conditionRating,
      builtOn: property.builtOn,
    });
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

  const localityName = (id: string) => {
    const l = localities.find((x) => x.id === id);
    return l ? l.name : '';
  };

  const propertyTypeName = (id: string) => {
    const pt = propertyTypes.find((x) => x.id === id);
    return pt ? pt.name : '';
  };

  const columns: Column<Property>[] = [
    { key: 'title', header: 'Title' },
    { key: 'locality', header: 'Locality', render: (p) => localityName(p.localityId) },
    { key: 'propertyType', header: 'Property type', render: (p) => propertyTypeName(p.propertyTypeId) },
    { key: 'bedrooms', header: 'Bedrooms' },
    { key: 'bathrooms', header: 'Bathrooms' },
    { key: 'carpetAreaSqft', header: 'Carpet area (sqft)' },
    { key: 'furnishing', header: 'Furnishing' },
    {
      key: 'conditionRating',
      header: 'Condition rating',
      render: (p) => (p.conditionRating === null ? 'Unrated' : String(p.conditionRating)),
    },
    { key: 'builtOn', header: 'Built on' },
  ];

  const localityOptions: TreeSelectOption[] = localities.map((l) => ({
    value: l.id,
    label: l.name,
    city: l.city,
    zone: l.zone,
  }));

  const propertyTypeOptions: SelectOption[] = propertyTypes.map((pt) => ({
    value: pt.id,
    label: pt.name,
  }));

  return (
    <>
      <div className="page-header">
        <h1>Properties</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add property</button>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          emptyMessage="No properties yet."
          renderActions={(p) => (
            <>
              <button className="btn btn-secondary" onClick={() => openEdit(p)}>Edit</button>{' '}
              <button className="btn btn-danger" onClick={() => onDelete(p.id)}>Delete</button>
            </>
          )}
        />
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit property' : 'New property'}
          submitLabel={editingId ? 'Save changes' : 'Add property'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleTitleChange} required />
          </div>
          <div className="field">
            <label htmlFor="localityId">Locality</label>
            <TreeSelect
              id="localityId"
              name="localityId"
              value={form.localityId}
              onChange={handleLocalityChange}
              options={localityOptions}
              placeholder="Select a locality"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="propertyTypeId">Property type</label>
            <AsyncSelect
              id="propertyTypeId"
              name="propertyTypeId"
              value={form.propertyTypeId}
              onChange={handlePropertyTypeChange}
              options={propertyTypeOptions}
              placeholder="Select a property type"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bedrooms">Bedrooms</label>
            <Stepper
              id="bedrooms"
              name="bedrooms"
              value={form.bedrooms}
              onChange={handleBedroomsChange}
              min={0}
              max={20}
            />
          </div>
          <div className="field">
            <label htmlFor="bathrooms">Bathrooms</label>
            <Stepper
              id="bathrooms"
              name="bathrooms"
              value={form.bathrooms}
              onChange={handleBathroomsChange}
              min={0}
              max={20}
            />
          </div>
          <div className="field">
            <label htmlFor="carpetAreaSqft">Carpet area (sqft)</label>
            <Slider
              id="carpetAreaSqft"
              name="carpetAreaSqft"
              value={form.carpetAreaSqft}
              onChange={handleCarpetAreaChange}
              min={150}
              max={6000}
            />
          </div>
          <div className="field">
            <label htmlFor="furnishing">Furnishing</label>
            <ToggleGroup
              id="furnishing"
              name="furnishing"
              value={form.furnishing}
              onChange={handleFurnishingChange}
              options={furnishingOptions}
            />
          </div>
          <div className="field">
            <label htmlFor="conditionRating">Condition rating</label>
            <StarRating
              id="conditionRating"
              name="conditionRating"
              value={form.conditionRating}
              onChange={handleConditionRatingChange}
              max={5}
            />
          </div>
          <div className="field">
            <label htmlFor="builtOn">Built on</label>
            <DatePicker
              id="builtOn"
              name="builtOn"
              value={form.builtOn}
              onChange={handleBuiltOnChange}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
