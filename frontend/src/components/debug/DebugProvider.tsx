import { createContext, useContext, useState, type ReactNode } from 'react';

interface DebugContextType {
  debugMode: boolean;
  toggleDebug: () => void;
}

const DebugContext = createContext<DebugContextType>({
  debugMode: false,
  toggleDebug: () => {},
});

export function useDebug() {
  return useContext(DebugContext);
}

export default function DebugProvider({ children }: { children: ReactNode }) {
  const [debugMode, setDebugMode] = useState(false);

  const toggleDebug = () => setDebugMode((prev) => !prev);

  return (
    <DebugContext.Provider value={{ debugMode, toggleDebug }}>
      {children}
    </DebugContext.Provider>
  );
}
