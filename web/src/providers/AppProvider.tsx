import { WebSocketEvent } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthority } from './AuthenticationProvider';

type AppProviderProps = {
  children: React.ReactNode;
};

type AppProviderState = {
  isWebSocketConnected?: boolean;
};

const initialState: AppProviderState = {
  isWebSocketConnected: false,
};

const AppProviderContext = createContext<AppProviderState>(initialState);

export function AppProvider({ children }: AppProviderProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthority();
  const [isWebSocketConnected, _setIsWebSocketConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const websocket = new WebSocket(localStorage.getItem('ws') || 'ws://localhost:8000/ws/0');

    websocket.onopen = () => {
      console.log('WebSocket connection established');
      //   setIsWebSocketConnected(true);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketEvent;
      const queryKey = [data.type];

      queryClient.invalidateQueries({ queryKey });
    };

    websocket.onclose = () => {
      //  setIsWebSocketConnected(false);
      console.log('WebSocket connection closed');
    };

    return () => {
      websocket.close();
    };
  }, [isAuthenticated]);

  return <AppProviderContext.Provider value={{ isWebSocketConnected }}>{children}</AppProviderContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppProviderContext);

  if (context === undefined) throw new Error('useAppContext must be used within a AppProvider');

  return context;
};
