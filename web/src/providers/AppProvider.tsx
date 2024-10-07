import { createContext, useContext } from 'react';

type AppProviderProps = {
  children: React.ReactNode;
};

type AppProviderState = {};

const initialState: AppProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const AppProviderContext = createContext<AppProviderState>(initialState);

export function AppProvider({ children }: AppProviderProps) {
  const value = {};

  return <AppProviderContext.Provider value={value}>{children}</AppProviderContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppProviderContext);

  if (context === undefined) throw new Error('useAppContext must be used within a AppProvider');

  return context;
};
