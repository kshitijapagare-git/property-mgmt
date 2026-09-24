export function getLandlordDeleteBlockMessage(landlordId, localities) {
  const count = localities.filter((l) => l.landlordId === landlordId).length;
  if (count === 0) return null;
  return `Cannot delete: landlord has ${count} localities.`;
}
