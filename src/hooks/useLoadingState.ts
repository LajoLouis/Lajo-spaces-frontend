import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

interface LoadingOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  resetOnSuccess?: boolean;
  resetOnError?: boolean;
}

export const useLoadingState = (initialData: any = null) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    data: initialData
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async <T>(
    asyncFn: (signal?: AbortSignal) => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      resetOnSuccess = false,
      resetOnError = false
    } = options;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const result = await asyncFn(signal);

      if (!signal.aborted) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          data: resetOnSuccess ? initialData : result,
          error: null
        }));

        if (showSuccessToast) {
          toast.success(successMessage || 'Operation completed successfully');
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      }
    } catch (error: any) {
      if (!signal.aborted) {
        const errorMsg = error.message || 'An error occurred';
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
          data: resetOnError ? initialData : prev.data
        }));

        if (showErrorToast) {
          toast.error(errorMessage || errorMsg);
        }

        if (onError) {
          onError(error);
        }
      }
    }

    return null;
  }, [initialData]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isLoading: false,
      error: null,
      data: initialData
    });
  }, [initialData]);

  const setData = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      data
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError
  };
};

// Hook for managing multiple loading states
export const useMultipleLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [key]: error
    }));
  }, []);

  const execute = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorMessage,
      onSuccess,
      onError
    } = options;

    setLoading(key, true);
    setError(key, null);

    try {
      const result = await asyncFn();
      
      setLoading(key, false);

      if (showSuccessToast) {
        toast.success(successMessage || 'Operation completed successfully');
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'An error occurred';
      
      setLoading(key, false);
      setError(key, errorMsg);

      if (showErrorToast) {
        toast.error(errorMessage || errorMsg);
      }

      if (onError) {
        onError(error);
      }

      return null;
    }
  }, [setLoading, setError]);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const getError = useCallback((key: string) => {
    return errors[key] || null;
  }, [errors]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      setErrors(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } else {
      setLoadingStates({});
      setErrors({});
    }
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    execute,
    isLoading,
    getError,
    reset,
    isAnyLoading,
    loadingStates,
    errors
  };
};

// Hook for form submission with loading state
export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(async <T>(
    submitFn: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = true,
      showErrorToast = true,
      successMessage = 'Form submitted successfully',
      errorMessage,
      onSuccess,
      onError
    } = options;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitFn();
      
      setIsSubmitting(false);

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to submit form';
      
      setIsSubmitting(false);
      setSubmitError(errorMsg);

      if (showErrorToast) {
        toast.error(errorMessage || errorMsg);
      }

      if (onError) {
        onError(error);
      }

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
  }, []);

  return {
    isSubmitting,
    submitError,
    submit,
    reset
  };
};

export default useLoadingState;
