import React from 'react';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <div className="section-header col-span-full my-8">
      <h2 className="section-title text-2xl font-semibold mb-4">
        {title}
      </h2>
    </div>
  );
};
