import { useState } from 'react';
import { submitCustomTrackRequest, SubmitRequestPayload } from '../services/api';

interface UseFormSubmissionReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitForm: (payload: SubmitRequestPayload) => Promise<{ success: boolean; id?: string }>;
  clearError: () => void;
}

export const useFormSubmission = (): UseFormSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitForm = async (payload: SubmitRequestPayload) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitCustomTrackRequest(payload);
      
      if (response.success) {
        return { success: true, id: response.data.id };
      } else {
        setSubmitError(response.message || 'Failed to submit request');
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setSubmitError(null);
  };

  return {
    isSubmitting,
    submitError,
    submitForm,
    clearError
  };
};