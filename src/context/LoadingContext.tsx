import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType>({ isLoading: false });

let activeRequests = 0;
let externalUpdate: (isLoading: boolean) => void = () => {};

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Sync internal state with external updates
  React.useEffect(() => {
    externalUpdate = setIsLoading;
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

// Non-hook helper for Axios interceptors
export const updateLoadingState = (delta: 1 | -1) => {
  activeRequests += delta;
  if (activeRequests < 0) activeRequests = 0;
  
  if (activeRequests > 0) {
    externalUpdate(true);
  } else {
    // Small delay to prevent flickering on fast requests
    setTimeout(() => {
      if (activeRequests === 0) externalUpdate(false);
    }, 100);
  }
};
