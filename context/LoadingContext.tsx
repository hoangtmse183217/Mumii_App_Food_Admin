import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  // Use useCallback to memoize these functions so they don't cause unnecessary re-renders in consumers
  const showLoader = useCallback(() => {
    setLoadingCount(prevCount => prevCount + 1);
  }, []);

  const hideLoader = useCallback(() => {
    // Ensure the count never goes below zero
    setLoadingCount(prevCount => Math.max(0, prevCount - 1));
  }, []);

  // The app is considered "loading" if the count is greater than 0.
  const isLoading = loadingCount > 0;

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const value = useMemo(() => ({ isLoading, showLoader, hideLoader }), [isLoading, showLoader, hideLoader]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
