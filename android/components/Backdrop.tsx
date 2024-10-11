import React, { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export const Backdrop = () => {
  const { open } = useBackdrop();

  if (!open) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        flex: 1,
        top: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        width: "100%",
        height: "100%",
        zIndex: 100,
      }}
    >
      <ActivityIndicator color="#fff" />
    </View>
  );
};

type BackdropState = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const BackdropContext = React.createContext<BackdropState>({
  open: false,
  onOpen: () => {},
  onClose: () => {},
});

export const BackdropProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <BackdropContext.Provider value={{ open, onOpen, onClose }}>
      {children}
      <Backdrop />
    </BackdropContext.Provider>
  );
};

export const useBackdrop = () => {
  const context = React.useContext(BackdropContext);

  if (context === undefined) {
    throw new Error("useBackdrop must be used within a BackdropProvider");
  }

  return context;
};
