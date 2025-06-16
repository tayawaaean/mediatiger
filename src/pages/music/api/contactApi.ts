import { ContactFormSubmissionData, ApiResponse } from '../types';

// Mock API function - replace with actual backend call
export const submitForm = async (data: ContactFormSubmissionData): Promise<ApiResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock validation
  if (!data.name || !data.email || !data.message) {
    return {
      success: false,
      message: 'All fields are required',
    };
  }

  // Mock success response
  console.log('Form submission data:', data);
  
  // Simulate sending email notification
  const subject = encodeURIComponent(`Website Contact Form - ${data.name}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
  );

  // Open email client after a short delay
  setTimeout(() => {
    window.location.href = `mailto:info@mediatiger.co?subject=${subject}&body=${body}`;
  }, 1000);

  return {
    success: true,
    message: 'Your message has been sent successfully!',
  };
};