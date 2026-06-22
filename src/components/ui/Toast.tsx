// src/components/ui/Toast.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration: number = 3000) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t: any) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t: any) => t.id !== id));
  }, []);

  const getToastStyles = (type: ToastType): string => {
    const styles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-black',
    };
    return styles[type];
  };

  const getIcon = (type: ToastType): string => {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return icons[type];
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast: any) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right-5 duration-300 ${getToastStyles(toast.type)}`}
              role="alert"
            >
              <span className="text-lg font-bold">{getIcon(toast.type)}</span>
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => hideToast(toast.id)}
                className="ml-auto hover:opacity-80"
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

