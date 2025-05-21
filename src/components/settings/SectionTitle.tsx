

// SectionTitle.tsx
import React from 'react';

interface SectionTitleProps {
    icon: React.ReactNode;
    title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title }) => {
    return (
        <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-white text-lg font-medium">{title}</h2>
        </div>
    );
};
