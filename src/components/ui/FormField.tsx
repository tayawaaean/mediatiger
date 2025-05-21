import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children }) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium text-slate-300 mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
};