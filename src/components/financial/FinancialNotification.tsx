'use client';

import { X, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface FinancialNotificationProps {
  notification: Notification;
  onClose: () => void;
}

export default function FinancialNotification({
  notification,
  onClose,
}: FinancialNotificationProps) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
        notification.type === 'success'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}
    >
      {notification.type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span>{notification.message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
