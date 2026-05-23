import { createContext, useContext, useState, ReactNode } from 'react';

interface ChaosContextType {
  chaosMode: boolean;
  setChaosMode: (value: boolean) => void;
  toggleChaosMode: () => void;
}

const ChaosContext = createContext<ChaosContextType | undefined>(undefined);

export const ChaosProvider = ({ children }: { children: ReactNode }) => {
  const [chaosMode, setChaosMode] = useState(false);

  const toggleChaosMode = () => setChaosMode(prev => !prev);

  return (
    <ChaosContext.Provider value={{ chaosMode, setChaosMode, toggleChaosMode }}>
      {children}
    </ChaosContext.Provider>
  );
};

export const useChaos = () => {
  const context = useContext(ChaosContext);
  if (context === undefined) {
    throw new Error('useChaos must be used within a ChaosProvider');
  }
  return context;
};
