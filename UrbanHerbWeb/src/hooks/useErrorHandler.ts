import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

interface ErrorWithMessage {
  message: string;
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
};

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown) => {
      const errorWithMessage = toErrorWithMessage(error);
      
      toast({
        title: 'An error occurred',
        description: errorWithMessage.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });

      // Log error for debugging
      console.error('Error occurred:', errorWithMessage);
    },
    [toast]
  );

  return { handleError };
};
