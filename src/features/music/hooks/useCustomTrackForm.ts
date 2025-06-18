import { useState } from 'react';
import { CustomRequest } from '../types';
import { useFormSubmission } from './useFormSubmission';

interface CustomTrackFormData {
  referenceTracks: string[];
  description: string;
  exampleVideos: string[];
}

export const useCustomTrackForm = () => {
  const [formData, setFormData] = useState<CustomTrackFormData>({
    referenceTracks: [''],
    description: '',
    exampleVideos: []
  });
  const [submittedRequests, setSubmittedRequests] = useState<CustomRequest[]>([]);
  const { isSubmitting, submitError, submitForm: submitToApi, clearError } = useFormSubmission();

  const addReferenceTrack = () => {
    setFormData(prev => ({
      ...prev,
      referenceTracks: [...prev.referenceTracks, '']
    }));
  };

  const updateReferenceTrack = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      referenceTracks: prev.referenceTracks.map((track, i) => 
        i === index ? value : track
      )
    }));
  };

  const removeReferenceTrack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceTracks: prev.referenceTracks.filter((_, i) => i !== index)
    }));
  };

  const updateDescription = (description: string) => {
    setFormData(prev => ({ ...prev, description }));
  };

  const addExampleVideo = () => {
    setFormData(prev => ({
      ...prev,
      exampleVideos: [...prev.exampleVideos, '']
    }));
  };

  const updateExampleVideo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      exampleVideos: prev.exampleVideos.map((video, i) => 
        i === index ? value : video
      )
    }));
  };

  const removeExampleVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exampleVideos: prev.exampleVideos.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      referenceTracks: [''],
      description: '',
      exampleVideos: []
    });
  };

  const submitForm = async () => {
    // Filter out empty strings
    const cleanedData = {
      ...formData,
      referenceTracks: formData.referenceTracks.filter(track => track.trim()),
      exampleVideos: formData.exampleVideos.filter(video => video.trim())
    };
    
    // Submit to API
    const result = await submitToApi(cleanedData);
    
    if (result.success) {
      // Create a new request object
      const newRequest: CustomRequest = {
        id: result.id || Date.now().toString(),
        submittedBy: 'You',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        referenceTracks: cleanedData.referenceTracks,
        description: cleanedData.description,
        exampleVideos: cleanedData.exampleVideos,
        priority: 'medium'
      };
      
      // Add to submitted requests
      setSubmittedRequests(prev => [newRequest, ...prev]);
      resetForm();
    }
  };

  return {
    formData,
    submittedRequests,
    isSubmitting,
    submitError,
    clearError,
    addReferenceTrack,
    updateReferenceTrack,
    removeReferenceTrack,
    updateDescription,
    addExampleVideo,
    updateExampleVideo,
    removeExampleVideo,
    submitForm,
    resetForm
  };
};