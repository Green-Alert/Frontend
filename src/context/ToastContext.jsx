import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // showToast(message, type?, duration?, options?)
  // options: { position?: 'bottom-right' | 'top-center', subtitle?: string }
  const showToast = useCallback((message, type = 'info', duration = 3000, options = {}) => {
    const id = crypto.randomUUID();
    const position = options.position ?? 'bottom-right';
    const subtitle  = options.subtitle ?? null;
    setToasts((prev) => [...prev, { id, message, type, duration, position, subtitle }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
