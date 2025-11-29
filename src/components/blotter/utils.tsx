import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'investigating':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'dismissed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'investigating':
      return <AlertCircle className="w-4 h-4 text-blue-600" />;
    case 'resolved':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'dismissed':
      return <XCircle className="w-4 h-4 text-gray-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

export const getInitialFormData = () => ({
  complainant: '',
  respondent: '',
  incidentType: '',
  incidentDate: new Date().toISOString().split('T')[0],
  location: '',
  status: 'pending' as const,
  filedDate: new Date().toISOString().split('T')[0],
  assignedTo: '',
  remarks: '',
});

export const validateBlotterForm = (formData: {
  complainant: string;
  respondent: string;
  incidentType: string;
  incidentDate: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!formData.complainant.trim()) errors.complainant = 'Complainant is required';
  if (!formData.respondent.trim()) errors.respondent = 'Respondent is required';
  if (!formData.incidentType) errors.incidentType = 'Incident type is required';
  if (!formData.incidentDate) errors.incidentDate = 'Incident date is required';
  return errors;
};
