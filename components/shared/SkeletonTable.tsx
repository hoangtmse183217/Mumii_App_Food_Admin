import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className={`flex items-center space-x-4 p-4 ${rowIndex !== rows - 1 ? 'border-b border-accent' : ''}`}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-2">
                <div className={`h-4 bg-gray-300 rounded ${colIndex === 0 ? 'w-1/4' : 'w-3/4'}`}></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;
