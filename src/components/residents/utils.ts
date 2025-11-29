// Helper functions for Residents

// Calculate age from birth date
export function calculateAge(birthDate: string | null | undefined): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Get full name from resident object
export function getFullName(resident: {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
}): string {
  const parts = [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix
  ].filter(Boolean);
  return parts.join(' ');
}

// Format resident ID for display
export function formatResidentId(id: string): string {
  return `#${id.toString().slice(-4).padStart(4, '0')}`;
}
