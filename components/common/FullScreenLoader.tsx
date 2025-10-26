import React from 'react';

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center" role="status" aria-live="polite">
      <div className="w-16 h-16 border-4 border-white border-t-highlight rounded-full animate-spin">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default FullScreenLoader;
