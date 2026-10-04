import { Client } from '../types';

/**
 * Checks if a given birthday (YYYY-MM-DD) is today
 */
export function isBirthdayToday(dateOfBirth: string, refDate: Date = new Date()): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  return (
    dob.getDate() === refDate.getDate() &&
    dob.getMonth() === refDate.getMonth()
  );
}

/**
 * Calculates days remaining until the next occurrence of the birthday.
 * 0 = today, 1 = tomorrow, etc.
 */
export function getDaysUntilBirthday(dateOfBirth: string, refDate: Date = new Date()): number {
  if (!dateOfBirth) return 999;
  const dob = new Date(dateOfBirth);
  const currentYear = refDate.getFullYear();

  let nextBday = new Date(currentYear, dob.getMonth(), dob.getDate());
  
  // Set times to midnight for accurate day difference
  nextBday.setHours(0, 0, 0, 0);
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  if (nextBday.getTime() < today.getTime()) {
    nextBday = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
  }

  const diffTime = nextBday.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the age the client is turning on their next / current birthday
 */
export function calculateAge(dateOfBirth: string, refDate: Date = new Date()): number {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  let age = refDate.getFullYear() - dob.getFullYear();
  const m = refDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < dob.getDate())) {
    // Hasn't had birthday yet this year
    return age;
  }
  return age;
}

/**
 * Formats a date string (YYYY-MM-DD) to a friendly string like "15 Aug 1988"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats birthday day and month like "15 October"
 */
export function formatBirthdayMonthDay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long'
  });
}

/**
 * Sorts clients by upcoming birthdays (closest first)
 */
export function sortClientsByUpcomingBirthday(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => {
    return getDaysUntilBirthday(a.date_of_birth) - getDaysUntilBirthday(b.date_of_birth);
  });
}

/**
 * Masks a policy number for security in customer emails.
 * Only the last 4 characters/digits are shown, preceded by XXXX-XXXX-
 * Example: "PLI-OD-2023-887410" -> "XXXX-XXXX-7410"
 */
export function maskPolicyNumber(policyNumber?: string): string {
  if (!policyNumber) return 'XXXX-XXXX';
  const clean = String(policyNumber).trim();
  if (clean.length <= 4) {
    return `XXXX-${clean}`;
  }
  const lastFour = clean.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
}
