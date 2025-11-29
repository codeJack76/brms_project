import { X, User, Calendar, Heart, Briefcase, MapPin, Phone, Mail, AlertCircle, Edit } from 'lucide-react';
import { Resident, ResidentFormData } from './types';
import { calculateAge, getFullName } from './utils';

interface ResidentViewModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (formData: ResidentFormData) => void;
}

export default function ResidentViewModal({
  resident,
  isOpen,
  onClose,
  onEdit,
}: ResidentViewModalProps) {
  if (!isOpen || !resident) return null;

  const handleEdit = () => {
    onClose();
    onEdit({
      id: resident.id,
      barangay_id: resident.barangay_id,
      first_name: resident.first_name,
      middle_name: resident.middle_name || undefined,
      last_name: resident.last_name,
      suffix: resident.suffix || undefined,
      gender: resident.gender || undefined,
      birth_date: resident.birth_date || undefined,
      civil_status: resident.civil_status || undefined,
      nationality: resident.nationality || undefined,
      occupation: resident.occupation || undefined,
      email: resident.email || undefined,
      mobile: resident.mobile || undefined,
      address: resident.address || undefined,
      purok: resident.purok || undefined,
      is_active: resident.is_active
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{resident.first_name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getFullName(resident)}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{resident.occupation || 'N/A'}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:scale-110 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{getFullName(resident)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{calculateAge(resident.birth_date)} years old</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.gender || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Civil Status</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.civil_status || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.birth_date || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.occupation || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.address || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.mobile || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{resident.email || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
              </div>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                resident.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
              }`}>
                {resident.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Resident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
