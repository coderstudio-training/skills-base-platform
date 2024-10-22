import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext<
  | {
      isOpen: boolean;
      setIsOpen: (isOpen: boolean) => void;
    }
  | undefined
>(undefined);

export const Dialog = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  return React.cloneElement(children as React.ReactElement, {
    onClick: () => context.setIsOpen(true),
  });
};

export const DialogContent = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogContent must be used within Dialog');

  if (!context.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">{children}</div>
    </div>
  );
};

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold">{children}</h2>
);

export const DialogDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => <p className="text-gray-600">{children}</p>;
