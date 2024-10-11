import { Slot } from "expo-router";
import { SessionProvider } from "@/providers/AuthenticationProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { AppProvider } from "@/providers/AppProvider";
import { StatusBar } from "react-native";
import { BackdropProvider } from "@/components/Backdrop";

axios.defaults.headers["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers["ngrok-skip-browser-warning"] = "true";
axios.interceptors.response.use(function (response) {
  return response.data;
});

const queryClient = new QueryClient();
StatusBar.setBarStyle("dark-content");

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AppProvider>
          <BackdropProvider>
            <Slot />
          </BackdropProvider>
        </AppProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
