// Resident Types and Interfaces

export interface Resident {
  id: string;
  barangay_id?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  civil_status?: string | null;
  nationality?: string | null;
  occupation?: string | null;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  purok?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Transformed properties for table display
  dateOfBirth?: string;
  phone?: string | null;
  status?: 'Active' | 'Inactive';
}

export interface ResidentFormData {
  id?: string;
  barangay_id?: string | null;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  gender?: string;
  birth_date?: string;
  civil_status?: string;
  nationality?: string;
  occupation?: string;
  email?: string;
  mobile?: string;
  address?: string;
  purok?: string;
  is_active?: boolean;
}

export type SortField = 'lastName' | 'gender' | 'dateOfBirth' | 'status' | null;
export type SortDirection = 'asc' | 'desc';

export interface ResidentStats {
  total: number;
  male: number;
  female: number;
  active: number;
  avgAge: number;
}
