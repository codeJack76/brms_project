'use client';

import { useState, useEffect } from 'react';
import { X, User, Calendar, Heart, Briefcase, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { ResidentFormData } from './types';
import { calculateAge } from './utils';

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResidentFormData) => Promise<void>;
  initialData: ResidentFormData | null;
  title: string;
}

export default function ResidentFormModal({ isOpen, onClose, onSave, initialData, title }: ResidentFormModalProps) {
  const [formData, setFormData] = useState<ResidentFormData>(initialData || {
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    gender: '',
    birth_date: '',
    civil_status: '',
    nationality: 'Filipino',
    occupation: '',
    email: '',
    mobile: '',
    address: '',
    purok: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.mobile && !/^[0-9]{10,11}$/.test(formData.mobile.replace(/[^0-9]/g, ''))) newErrors.mobile = 'Invalid mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSaving(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error saving resident:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {initialData?.id ? 'Update resident information' : 'Register a new barangay resident'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              type="button" 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all" 
              disabled={isSaving}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.first_name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter first name"
                    disabled={isSaving}
                  />
                  {errors.first_name && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.first_name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middle_name || ''}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter middle name"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.last_name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter last name"
                    disabled={isSaving}
                  />
                  {errors.last_name && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.last_name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={formData.suffix || ''}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Jr., Sr., III, etc."
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Demographics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Demographics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Age
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.birth_date ? `${calculateAge(formData.birth_date)} years old` : 'Not set'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Heart className="w-4 h-4" />
                    Civil Status
                  </label>
                  <select
                    value={formData.civil_status || ''}
                    onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality || ''}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Filipino"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Briefcase className="w-4 h-4" />
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Engineer, Teacher, etc."
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Address & Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address & Contact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    Complete Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="House No., Street, Subdivision"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purok/Zone</label>
                  <input
                    type="text"
                    value={formData.purok || ''}
                    onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Purok 1, Zone A, etc."
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.mobile ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="09171234567"
                    disabled={isSaving}
                  />
                  {errors.mobile && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.mobile}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.email ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="juan@email.com"
                    disabled={isSaving}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={formData.is_active ? 'Active' : 'Inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'Active' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>{initialData?.id ? 'Update' : 'Create'} Resident</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
