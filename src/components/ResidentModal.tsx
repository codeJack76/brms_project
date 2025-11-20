import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from './Modal';

export interface ResidentFormData {
  id?: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  address?: string;
  phone?: string;
  email?: string;
  civilStatus?: string;
  occupation?: string;
  status?: 'Active' | 'Inactive';
}

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResidentFormData) => void | Promise<void>;
  initialData?: ResidentFormData | null;
  title?: string;
}

export default function ResidentModal({ isOpen, onClose, onSave, initialData = null, title = 'Add Resident' }: ResidentModalProps) {
  const initialRef = useRef<ResidentFormData | null>(null);

  const emptyForm = useMemo<ResidentFormData>(() => ({
    name: '',
    dateOfBirth: '',
    gender: '',
    age: undefined,
    address: '',
    phone: '',
    email: '',
    civilStatus: '',
    occupation: '',
    status: 'Active',
  }), []);

  const [form, setForm] = useState<ResidentFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData });
      initialRef.current = { ...initialData };
    } else {
      setForm({ ...emptyForm });
      initialRef.current = { ...emptyForm };
    }
    setErrors({});
    setSaveError(null);
  }, [initialData, isOpen, emptyForm]);

  const isDirty = () => {
    const base = initialRef.current || emptyForm;
    return JSON.stringify(base) !== JSON.stringify(form);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim() === '') e.name = 'Full name is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email address';
    if (form.phone && !/^\+?[0-9\s\-()]{7,20}$/.test(form.phone)) e.phone = 'Invalid phone number';
    return e;
  };

  const handleChange = (key: keyof ResidentFormData, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const onCloseWithConfirm = () => {
    if (isDirty()) {
      const ok = window.confirm('You have unsaved changes. Discard them?');
      if (!ok) return;
    }
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) return;

    // Basic age calculation if dateOfBirth provided and age empty
    if ((!form.age || form.age === 0) && form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const diff = Date.now() - dob.getTime();
      const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      setForm((s) => ({ ...s, age }));
    }

    setIsSaving(true);
    setSaveError(null);
    const payload = { ...form } as ResidentFormData;
    if (!payload.id) payload.id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      await Promise.resolve(onSave(payload));
      // close after successful save
      onClose();
    } catch (err: any) {
      console.error('Error saving resident:', err);
      setSaveError(err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <>
      <div className="flex items-center gap-3 w-full justify-end">
        <button type="button" onClick={onCloseWithConfirm} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-white ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          aria-disabled={isSaving}
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onCloseWithConfirm} title={title} size="md" footer={footer}>
      <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
        {saveError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{saveError}</div>
        )}

        <div>
          <label htmlFor="resident-name" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Full name *</label>
          <input id="resident-name" aria-invalid={!!errors.name} value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="resident-dob" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Date of Birth</label>
            <input id="resident-dob" type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="resident-gender" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Gender</label>
            <select id="resident-gender" value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="resident-phone" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label>
            <input id="resident-phone" aria-invalid={!!errors.phone} value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="resident-email" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input id="resident-email" aria-invalid={!!errors.email} value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="resident-address" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Address</label>
          <input id="resident-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="resident-civil" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Civil Status</label>
            <input id="resident-civil" value={form.civilStatus} onChange={(e) => handleChange('civilStatus', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="resident-occupation" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Occupation</label>
            <input id="resident-occupation" value={form.occupation} onChange={(e) => handleChange('occupation', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
        </div>
      </form>
    </Modal>
  );
}
