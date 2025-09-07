import { useCallback } from 'react';
import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

export const useToast = () => {
  const success = useCallback((message: string, options?: ToastOptions) => {
    hotToast.success(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? 'bottom-right',
    });
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    hotToast.error(message, {
      duration: options?.duration ?? 5000,
      position: options?.position ?? 'bottom-right',
    });
  }, []);

  const info = useCallback((message: string, options?: ToastOptions) => {
    hotToast(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? 'bottom-right',
    });
  }, []);

  const loading = useCallback((message: string, options?: ToastOptions) => {
    return hotToast.loading(message, {
      duration: options?.duration ?? Infinity,
      position: options?.position ?? 'bottom-right',
    });
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      hotToast.dismiss(toastId);
    } else {
      hotToast.dismiss();
    }
  }, []);

  return {
    success,
    error,
    info,
    loading,
    dismiss,
  };
};
