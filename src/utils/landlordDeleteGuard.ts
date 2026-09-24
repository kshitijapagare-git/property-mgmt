/**
 * Only the `landlordId` of each locality matters here, so the parameter asks for exactly
 * that — callers pass full `Locality` objects, and tests pass bare `{ landlordId }` rows.
 */
export function getLandlordDeleteBlockMessage(
  landlordId: string,
  localities: { landlordId: string }[]
): string | null {
  const count = localities.filter((l) => l.landlordId === landlordId).length;
  if (count === 0) return null;
  return `Cannot delete: landlord has ${count} localities.`;
}
