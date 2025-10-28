import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 10 }) => {
  if (totalPages <= 0 && totalItems === 0) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center py-2 px-4 bg-secondary border-t border-accent mt-auto">
        <span className="text-sm text-text-secondary mb-2 sm:mb-0">
          Hiển thị 0-0 trên tổng số 0 mục
        </span>
        <div className="flex items-center space-x-2">
          <button disabled className="px-4 py-2 bg-secondary border border-accent rounded-lg opacity-50 cursor-not-allowed">Trước</button>
          <span className="px-4 py-2 text-sm text-text-secondary">Trang 1 / 1</span>
          <button disabled className="px-4 py-2 bg-secondary border border-accent rounded-lg opacity-50 cursor-not-allowed">Tiếp</button>
        </div>
      </div>
    );
  }

  if (totalPages <= 0) {
    return null;
  }

  const startItem = totalItems !== undefined && totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems !== undefined && totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-2 px-4 bg-secondary border-t border-accent mt-auto">
      {totalItems !== undefined ? (
        <span className="text-sm text-text-secondary mb-2 sm:mb-0">
          Hiển thị {startItem}-{endItem} trên tổng số {totalItems} mục
        </span>
      ) : (
        <span /> // Keep space for alignment
      )}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors"
        >
          Trước
        </button>
        <span className="px-4 py-2 text-sm text-text-secondary">
          Trang {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-secondary border border-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
};

export default Pagination;
