import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, User, Edit, Trash2, Eye, X, ChevronUp, ChevronDown, ChevronsUpDown, Filter, Download, Users, Mail, Phone, MapPin, Calendar, Briefcase, Heart, AlertCircle } from 'lucide-react';

interface Resident {
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
}

interface ResidentFormData {
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

type SortField = 'first_name' | 'last_name' | 'birth_date' | 'gender' | 'civil_status' | 'is_active' | null;
type SortDirection = 'asc' | 'desc';

// Helper function to calculate age from birth date
function calculateAge(birthDate: string | null | undefined): number {
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

// Helper function to get full name
function getFullName(resident: Resident): string {
  const parts = [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix
  ].filter(Boolean);
  return parts.join(' ');
}

// Enhanced Modal Component
function ResidentModal({ isOpen, onClose, onSave, initialData, title }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResidentFormData) => Promise<void>;
  initialData: ResidentFormData | null;
  title: string;
}) {
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
export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentFormData | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAgeMin, setFilterAgeMin] = useState<string>('');
  const [filterAgeMax, setFilterAgeMax] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch residents on mount
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/residents');
      const data = await response.json();
      
      if (response.ok) {
        setResidents(data.residents || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch residents');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch residents');
      console.error('Error fetching residents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResident = async (data: ResidentFormData) => {
    try {
      if (data.id) {
        // Update existing resident
        const response = await fetch(`/api/residents/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update resident');
        }

        const result = await response.json();
        setResidents(prev => prev.map(r => r.id === data.id ? result.resident : r));
      } else {
        // Create new resident
        const response = await fetch('/api/residents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create resident');
        }

        const result = await response.json();
        setResidents(prev => [result.resident, ...prev]);
      }
      
      setEditingResident(null);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Error saving resident:', err);
      alert(err.message || 'Failed to save resident');
      throw err;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedResidents.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ok = window.confirm(`Delete ${selectedIds.size} resident(s)?`);
    if (!ok) return;
    
    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/residents/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      setResidents((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Error deleting residents:', err);
      alert('Failed to delete some residents');
    }
  };

  const handleDeleteOne = async (id: string) => {
    const ok = window.confirm('Delete this resident?');
    if (!ok) return;
    
    try {
      const response = await fetch(`/api/residents/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete resident');
      }
      
      setResidents((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Error deleting resident:', err);
      alert(err.message || 'Failed to delete resident');
    }
  };

  const clearFilters = () => {
    setFilterGender('');
    setFilterStatus('');
    setFilterAgeMin('');
    setFilterAgeMax('');
  };

  const filteredAndSortedResidents = useMemo(() => {
    let result = [...residents];

    if (searchTerm) {
      result = result.filter((r) => {
        const fullName = getFullName(r).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return fullName.includes(searchLower) ||
          (r.address || '').toLowerCase().includes(searchLower) ||
          (r.email || '').toLowerCase().includes(searchLower) ||
          (r.mobile || '').includes(searchTerm);
      });
    }

    if (filterGender) {
      result = result.filter((r) => r.gender === filterGender);
    }
    if (filterStatus) {
      const isActive = filterStatus === 'Active';
      result = result.filter((r) => r.is_active === isActive);
    }
    if (filterAgeMin) {
      result = result.filter((r) => calculateAge(r.birth_date) >= parseInt(filterAgeMin, 10));
    }
    if (filterAgeMax) {
      result = result.filter((r) => calculateAge(r.birth_date) <= parseInt(filterAgeMax, 10));
    }

    if (sortField) {
      result.sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];
        
        // Special handling for name sorting
        if (sortField === 'first_name' || sortField === 'last_name') {
          aVal = (aVal || '').toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [residents, searchTerm, filterGender, filterStatus, filterAgeMin, filterAgeMax, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedResidents.length / pageSize);
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedResidents.slice(start, start + pageSize);
  }, [filteredAndSortedResidents, currentPage, pageSize]);

  const activeFiltersCount = [filterGender, filterStatus, filterAgeMin, filterAgeMax].filter(Boolean).length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const stats = useMemo(() => ({
    total: residents.length,
    male: residents.filter(r => r.gender === 'Male').length,
    female: residents.filter(r => r.gender === 'Female').length,
    active: residents.filter(r => r.is_active).length,
    avgAge: residents.length > 0 
      ? Math.round(residents.reduce((sum, r) => sum + calculateAge(r.birth_date), 0) / residents.length)
      : 0
  }), [residents]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Residents Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive barangay residents database</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading residents...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button 
              onClick={fetchResidents}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Residents</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-100" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Male</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.male}</p>
              <p className="text-xs text-gray-500 mt-1">{((stats.male/stats.total)*100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Female</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.female}</p>
              <p className="text-xs text-gray-500 mt-1">{((stats.female/stats.total)*100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1">{((stats.active/stats.total)*100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Age</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgAge}</p>
              <p className="text-xs text-gray-500 mt-1">years old</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Residents Table with Integrated Search/Filter - Clearance Style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200">
        {/* Search and Actions Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, address, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 hover:shadow-md ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700' : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'}`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>}
              </button>

              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>New Resident</span>
              </button>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age (Min)</label>
                  <input type="number" value={filterAgeMin} onChange={(e) => setFilterAgeMin(e.target.value)} placeholder="e.g. 18" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age (Max)</label>
                  <input type="number" value={filterAgeMax} onChange={(e) => setFilterAgeMax(e.target.value)} placeholder="e.g. 65" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline">Clear all filters</button>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resident Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {paginatedResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No residents found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{resident.id.toString().slice(-4).padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{getFullName(resident)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{resident.gender || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{calculateAge(resident.birth_date)} years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{resident.mobile || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        resident.is_active 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {resident.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { setSelectedResident(resident); setShowModal(true); }}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:bg-blue-900/30 rounded transition-all duration-200 hover:scale-110"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { 
                            setEditingResident({
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
                            setIsCreateModalOpen(true); 
                          }}
                          className="p-1 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 dark:bg-yellow-900/30 rounded transition-all duration-200 hover:scale-110"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOne(resident.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 dark:bg-red-900/30 rounded transition-all duration-200 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Clearance Style */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {paginatedResidents.length} of {filteredAndSortedResidents.length} residents
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              Previous
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700/50 hover:shadow-md'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced View Modal */}
      {showModal && selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{selectedResident.first_name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getFullName(selectedResident)}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedResident.occupation || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:scale-110 hover:rotate-90">
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
                  <p className="text-gray-900 dark:text-white font-medium">{getFullName(selectedResident)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{calculateAge(selectedResident.birth_date)} years old</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.gender || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Civil Status</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.civil_status || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.birth_date || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.occupation || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.address || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.mobile || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedResident.email || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                    selectedResident.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                  }`}>
                    {selectedResident.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingResident({
                      id: selectedResident.id,
                      barangay_id: selectedResident.barangay_id,
                      first_name: selectedResident.first_name,
                      middle_name: selectedResident.middle_name || undefined,
                      last_name: selectedResident.last_name,
                      suffix: selectedResident.suffix || undefined,
                      gender: selectedResident.gender || undefined,
                      birth_date: selectedResident.birth_date || undefined,
                      civil_status: selectedResident.civil_status || undefined,
                      nationality: selectedResident.nationality || undefined,
                      occupation: selectedResident.occupation || undefined,
                      email: selectedResident.email || undefined,
                      mobile: selectedResident.mobile || undefined,
                      address: selectedResident.address || undefined,
                      purok: selectedResident.purok || undefined,
                      is_active: selectedResident.is_active
                    }); 
                    setIsCreateModalOpen(true); 
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Resident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create / Edit Resident Modal */}
      <ResidentModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingResident(null); }}
        onSave={handleSaveResident}
        initialData={editingResident}
        title={editingResident?.id ? 'Edit Resident' : 'Add New Resident'}
      />
      </>
      )}
    </div>
  );
}