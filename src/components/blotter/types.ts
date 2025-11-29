export interface BlotterRecord {
  id: string;
  barangayId?: string;
  caseNumber: string;
  complainant: string;
  respondent: string;
  incidentType: string;
  incidentDate: string;
  location: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  filedDate: string;
  assignedTo: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlotterFormData {
  complainant: string;
  respondent: string;
  incidentType: string;
  incidentDate: string;
  location: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  filedDate: string;
  assignedTo: string;
  remarks: string;
}

export interface BlotterStatistics {
  totalCases: number;
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
}

export const INCIDENT_TYPES = [
  'Physical Injury',
  'Verbal Threat',
  'Property Damage',
  'Noise Complaint',
  'Trespassing',
  'Theft',
  'Domestic Dispute',
  'Land Dispute',
  'Other'
];

export const ASSIGNEES = [
  'Brgy. Captain',
  'Brgy. Kagawad',
  'Brgy. Secretary',
  'Brgy. Tanod',
  'Lupon Member'
];
