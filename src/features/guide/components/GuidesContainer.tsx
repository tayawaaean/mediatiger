import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ContentPanel from './ContentPanel';
import { GuideType } from '../../../types/guide';

const guides: GuideType[] = [
  {
    id: 'upload',
    title: 'Upload Guide',
    hasIcon: true,
  },
  {
    id: 'music',
    title: 'Music Guide',
    hasIcon: true,
  },
  {
    id: 'payments',
    title: 'How to Setup Payments',
    hasIcon: true,
  },
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    hasIcon: true,
  },
];

const GuidesContainer: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState<string>('upload');

  const handleGuideClick = (guideId: string) => {
    setActiveGuide(guideId);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <Sidebar 
        guides={guides} 
        activeGuide={activeGuide} 
        onGuideClick={handleGuideClick} 
      />
      <ContentPanel activeGuide={activeGuide} />
    </div>
  );
};

export default GuidesContainer;