import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => {
    setLoadingCount((count) => count + 1);
  };

  const stopLoading = () => {
    setLoadingCount((count) => Math.max(0, count - 1));
  };

  const loading = loadingCount > 0;

  return (
    <LoadingContext.Provider
      value={{
        loading,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  return useContext(LoadingContext);
};