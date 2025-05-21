import React from 'react';

interface MoodProps {
  mood: {
    id: string;
    name: string;
    image: string;
    backgroundColor: string;
  };
  onClick: () => void;
}

const MoodCard: React.FC<MoodProps> = ({ mood, onClick }) => {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div 
        className="aspect-square rounded-lg overflow-hidden relative mb-2"
        style={{ backgroundColor: mood.backgroundColor }}
      >
        <img
          src={mood.image}
          alt={mood.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
      <h3 className="text-white font-medium">{mood.name}</h3>
    </div>
  );
};

export default MoodCard;