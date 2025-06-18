import { useState, useEffect } from 'react';
import { CustomRequest } from '../types';
import { useFormSubmission, fetchUserRequests } from '../services/api';

interface CustomTrackFormData {
  reference_tracks: string[];
  description: string;
  example_videos: string[];
}

export const useCustomTrackForm = () => {
  const [formData, setFormData] = useState<CustomTrackFormData>({
    reference_tracks: [''],
    description: '',
    example_videos: []
  });
  const [submittedRequests, setSubmittedRequests] = useState<CustomRequest[]>([]);
  const { isSubmitting, submitError, submitForm: submitToApi, clearError } = useFormSubmission();

  useEffect(() => {
    const loadRequests = async () => {
      const response = await fetchUserRequests();
      if (response.success) {
        setSubmittedRequests(response.data);
      }
    };
    loadRequests();
  }, []);

  const addReferenceTrack = () => {
    setFormData(prev => ({
      ...prev,
      reference_tracks: [...prev.reference_tracks, '']
    }));
  };

  const updateReferenceTrack = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      reference_tracks: prev.reference_tracks.map((track, i) => 
        i === index ? value : track
      )
    }));
  };

  const removeReferenceTrack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reference_tracks: prev.reference_tracks.filter((_, i) => i !== index)
    }));
  };

  const updateDescription = (description: string) => {
    setFormData(prev => ({ ...prev, description }));
  };

  const addExampleVideo = () => {
    setFormData(prev => ({
      ...prev,
      example_videos: [...prev.example_videos, '']
    }));
  };

  const updateExampleVideo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      example_videos: prev.example_videos.map((video, i) => 
        i === index ? value : video
      )
    }));
  };

  const removeExampleVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      example_videos: prev.example_videos.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      reference_tracks: [''],
      description: '',
      example_videos: []
    });
  };

  const submitForm = async () => {
    const cleanedData = {
      ...formData,
      reference_tracks: formData.reference_tracks.filter(track => track.trim()),
      example_videos: formData.example_videos.filter(video => video.trim())
    };
    
    const result = await submitToApi(cleanedData);
    
    if (result.success) {
      const response = await fetchUserRequests();
      if (response.success) {
        setSubmittedRequests(response.data);
      }
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