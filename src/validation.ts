// Established here so Landlord and Tenant (and any later ticket) validate email the same way,
// rather than each defining its own regex.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | undefined =>
  EMAIL_REGEX.test(value) ? undefined : 'Enter a valid email address.';
