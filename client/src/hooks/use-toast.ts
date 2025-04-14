// Hooks for the toast component
import { useState, useEffect, useCallback } from 'react';

// Toast variant types
type ToastVariant = 'default' | 'destructive';

// Toast data interface
interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Interface for the toast hook
interface UseToastReturn {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = DEFAULT_TOAST_DURATION }: Omit<ToastData, 'id'>): string => {
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, variant, duration },
      ]);
      
      return id;
    },
    []
  );

  // Auto-dismiss toasts after their duration
  useEffect(() => {
    const timeouts = toasts.map((toast) => {
      const timeout = setTimeout(() => {
        dismiss(toast.id);
      }, toast.duration);
      
      return { id: toast.id, timeout };
    });
    
    return () => {
      timeouts.forEach(({ timeout }) => clearTimeout(timeout));
    };
  }, [toasts, dismiss]);

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
}