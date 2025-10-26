import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm text-text-secondary">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
