import { Client } from '../types';

/**
 * Checks if a given birthday (YYYY-MM-DD) is today
 */
export function isBirthdayToday(dateOfBirth: string, refDate: Date = new Date()): boolean {
  if (!dateOfBirth) return false;
  const clean = String(dateOfBirth).trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return day === refDate.getDate() && month === refDate.getMonth();
  }
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
  const clean = String(dateOfBirth).trim().split('T')[0];
  const parts = clean.split('-');
  let birthMonth: number;
  let birthDay: number;

  if (parts.length === 3 && parts[0].length === 4) {
    birthMonth = parseInt(parts[1], 10) - 1;
    birthDay = parseInt(parts[2], 10);
  } else {
    const dob = new Date(dateOfBirth);
    birthMonth = dob.getMonth();
    birthDay = dob.getDate();
  }

  const currentYear = refDate.getFullYear();
  let nextBday = new Date(currentYear, birthMonth, birthDay);
  
  // Set times to midnight for accurate day difference
  nextBday.setHours(0, 0, 0, 0);
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  if (nextBday.getTime() < today.getTime()) {
    nextBday = new Date(currentYear + 1, birthMonth, birthDay);
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
 * Formats a date string strictly to DD/MM/YYYY format.
 * Prevents timezone offset shifts and locale discrepancies.
 * Example: "2005-10-05" -> "05/10/2005"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const clean = String(dateStr).trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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
