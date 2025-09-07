import { useEffect } from 'react';
import { api } from '@/utils/api';
import { showError } from '@/lib/errors';

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  const { enabled = true, onSuccess, onError } = options;

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await queryFn();
        if (isMounted) {
          onSuccess?.(data);
        }
      } catch (error) {
        if (isMounted) {
          onError?.(error);
          showError(error);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [enabled, queryFn, onSuccess, onError]);
}

export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  options: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  const { onSuccess, onError } = options;

  const mutate = async (input: TInput) => {
    try {
      const data = await mutationFn(input);
      onSuccess?.(data);
      return data;
    } catch (error) {
      onError?.(error);
      showError(error);
      throw error;
    }
  };

  return { mutate };
}
