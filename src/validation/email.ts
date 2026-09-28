// Thin re-export: the canonical email regex/validator lives in src/validation.ts (established
// there so Landlord's existing form and this shared module never diverge). This file exists at
// the path later tickets (e.g. Tenant) were told to import from, without declaring a second
// regex — per the technical note to reuse Landlord's email check rather than writing a new one.
export { EMAIL_REGEX, validateEmail } from '../validation';
