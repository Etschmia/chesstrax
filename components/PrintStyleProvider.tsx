import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrintStyleContextType {
  isPrintMode: boolean;
  enablePrintMode: () => void;
  disablePrintMode: () => void;
  togglePrintMode: () => void;
}

const PrintStyleContext = createContext<PrintStyleContextType | undefined>(undefined);

export const usePrintStyle = () => {
  const context = useContext(PrintStyleContext);
  if (context === undefined) {
    throw new Error('usePrintStyle must be used within a PrintStyleProvider');
  }
  return context;
};

interface PrintStyleProviderProps {
  children: React.ReactNode;
  isPrintMode?: boolean;
}

export const PrintStyleProvider: React.FC<PrintStyleProviderProps> = ({ 
  children, 
  isPrintMode: initialPrintMode = false 
}) => {
  const [isPrintMode, setIsPrintMode] = useState(initialPrintMode);

  const enablePrintMode = () => setIsPrintMode(true);
  const disablePrintMode = () => setIsPrintMode(false);
  const togglePrintMode = () => setIsPrintMode(prev => !prev);

  // Apply CSS classes to document body based on print mode
  useEffect(() => {
    const body = document.body;
    
    if (isPrintMode) {
      body.classList.add('print-mode', 'print-white-bg', 'print-dark-text');
    } else {
      body.classList.remove('print-mode', 'print-white-bg', 'print-dark-text');
    }

    // Cleanup function to remove classes when component unmounts
    return () => {
      body.classList.remove('print-mode', 'print-white-bg', 'print-dark-text');
    };
  }, [isPrintMode]);

  const contextValue: PrintStyleContextType = {
    isPrintMode,
    enablePrintMode,
    disablePrintMode,
    togglePrintMode,
  };

  return (
    <PrintStyleContext.Provider value={contextValue}>
      <div className={isPrintMode ? 'print-mode print-white-bg print-dark-text' : ''}>
        {children}
      </div>
    </PrintStyleContext.Provider>
  );
};