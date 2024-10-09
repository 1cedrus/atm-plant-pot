import React, { useState } from 'react';

export const Backdrop = () => {
  const { open } = useBackdrop();

  return (
    <div
      className={
        !open
          ? 'hidden'
          : 'fixed h-full w-full bg-black bg-opacity-50 top-0 left-0 flex justify-center items-center cursor-wait'
      }>
      <div className='text-8xl animate-spin'>🌺</div>
    </div>
  );
};

type BackdropState = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const BackdropContext = React.createContext<BackdropState>({ open: false, onOpen: () => {}, onClose: () => {} });

export const BackdropProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <BackdropContext.Provider value={{ open, onOpen, onClose }}>
      <div className={open ? 'blur-sm' : ''}>{children}</div>
      <Backdrop />
    </BackdropContext.Provider>
  );
};

export const useBackdrop = () => {
  const context = React.useContext(BackdropContext);

  if (context === undefined) {
    throw new Error('useBackdrop must be used within a BackdropProvider');
  }

  return context;
};
