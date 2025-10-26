import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[51] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <svg className="mx-auto mb-4 text-error h-12 w-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
          <p className="text-text-secondary mb-6">{message}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-secondary rounded-lg border border-accent hover:bg-primary focus:ring-4 focus:outline-none focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-center text-white bg-error rounded-lg hover:opacity-90 focus:ring-4 focus:outline-none focus:ring-red-300"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
