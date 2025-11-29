'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FinancialStatsCards,
  FinancialFilters,
  FinancialTable,
  FinancialPagination,
  FinancialViewModal,
  FinancialFormModal,
  FinancialDeleteModal,
  FinancialNotification,
  Transaction,
  Statistics,
  FormData,
  ModalMode,
  SortField,
  SortDirection,
  initialFormData,
} from '@/components/financial';

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('transactionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch transactions
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/financial');
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to fetch transactions' });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setNotification({ type: 'error', message: 'Error loading transactions' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/financial/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStatistics(data.stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((txn) => {
      const matchesSearch =
        txn.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (txn.paidBy?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || txn.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || txn.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] ?? '';
      let bValue: string | number = b[sortField] ?? '';
      
      if (sortField === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'transactionDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedStatus, sortField, sortDirection]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Handlers
  const handleCreate = () => {
    setFormData(initialFormData);
    setSelectedTransaction(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transactionDate,
      paid_by: transaction.paidBy || '',
      received_by: transaction.receivedBy || '',
      reference_number: transaction.referenceNumber || '',
      status: transaction.status,
      notes: transaction.notes || '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.category || formData.amount <= 0) {
      setNotification({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSaving(true);
    try {
      const url = modalMode === 'create' ? '/api/financial' : `/api/financial/${selectedTransaction?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: modalMode === 'create' ? 'Transaction created successfully' : 'Transaction updated successfully',
        });
        setShowModal(false);
        fetchTransactions();
        fetchStatistics();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to save transaction' });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      setNotification({ type: 'error', message: 'Error saving transaction' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/financial/${selectedTransaction.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Transaction deleted successfully' });
        setShowModal(false);
        fetchTransactions();
        fetchStatistics();
      } else {
        const data = await response.json();
        setNotification({ type: 'error', message: data.error || 'Failed to delete transaction' });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setNotification({ type: 'error', message: 'Error deleting transaction' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <FinancialNotification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track revenue, expenses, and transactions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <FinancialStatsCards statistics={statistics} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading transactions...</span>
        </div>
      )}

      {!isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Filters */}
          <FinancialFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onCreateNew={handleCreate}
          />

          {/* Table */}
          <FinancialTable
            transactions={paginatedTransactions}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <FinancialPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTransactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (modalMode === 'create' || modalMode === 'edit') && (
        <FinancialFormModal
          mode={modalMode}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          isSaving={isSaving}
        />
      )}

      {/* View Modal */}
      {showModal && modalMode === 'view' && selectedTransaction && (
        <FinancialViewModal
          transaction={selectedTransaction}
          onClose={() => setShowModal(false)}
          onEdit={handleEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showModal && modalMode === 'delete' && selectedTransaction && (
        <FinancialDeleteModal
          transaction={selectedTransaction}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowModal(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
