import { WebSocketEvent } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import { useSession } from "./AuthenticationProvider";
import useStorageState from "@/hooks/useStorageState";
import axios from "axios";

type AppProviderProps = {
  children: React.ReactNode;
};

type AppProviderState = {
  setAddress: (address: string) => void;
  setWs: (ws: string) => void;
};

const initialState: AppProviderState = {
  setAddress: () => {},
  setWs: () => {},
};

const AppProviderContext = createContext<AppProviderState>(initialState);

export function AppProvider({ children }: AppProviderProps) {
  const queryClient = useQueryClient();
  const [[isLoadingAddress, address], setAddress] = useStorageState("address");
  const [[isLoadingWs, ws], setWs] = useStorageState("ws");
  const { signOut } = useSession();

  useEffect(() => {
    if (!address) {
      return;
    }

    axios.defaults.baseURL = address;
  }, [address]);

  useEffect(() => {
    if (!ws) {
      return;
    }

    let timeout: NodeJS.Timeout | null = null;

    const websocket = new WebSocket(ws);

    websocket.onopen = () => {
      console.log("WebSocket connection established");

      if (timeout) {
        clearTimeout(timeout);
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketEvent;
      const queryKey = [data.type];
      queryClient.invalidateQueries({ queryKey });
    };

    websocket.onclose = () => {
      timeout = setTimeout(() => {
        signOut();
      }, 5000);
    };

    return () => {
      websocket.close();
    };
  }, [ws]);

  useEffect(() => {
    if (isLoadingAddress || isLoadingWs) return;

    if (!address) {
      signOut();
    }
  }, [isLoadingWs, isLoadingAddress]);

  return (
    <AppProviderContext.Provider value={{ setAddress, setWs }}>
      {children}
    </AppProviderContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppProviderContext);

  if (context === undefined)
    throw new Error("useAppContext must be used within a AppProvider");

  return context;
};
