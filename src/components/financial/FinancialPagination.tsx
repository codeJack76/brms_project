'use client';

interface FinancialPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function FinancialPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: FinancialPaginationProps) {
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} transactions
      </p>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
          .map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {page}
            </button>
          ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
