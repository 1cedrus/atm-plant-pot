import { WebSocketEvent } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect } from 'react';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    const websocket = new WebSocket(import.meta.env.VITE_WS_URL as string);

    websocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketEvent;
      const queryKey = [data.type];
      queryClient.invalidateQueries({ queryKey });
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      websocket.close();
    };
  }, []);

  return <AppProviderContext.Provider value={{}}>{children}</AppProviderContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppProviderContext);

  if (context === undefined) throw new Error('useAppContext must be used within a AppProvider');

  return context;
};
