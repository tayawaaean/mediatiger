import React from 'react';
import MoodCard from './MoodCard';
import { useLanguage } from '../../../contexts/LanguageContext'; // Adjust path as needed

interface MoodSectionProps {
  onMoodSelect: (mood: string) => void;
}

interface Mood {
  id: string;
  name: string;
  image: string;
  backgroundColor: string;
}

const MoodSection: React.FC<MoodSectionProps> = ({ onMoodSelect }) => {
  const { translate } = useLanguage(); // Hook for translation

  // Define moods with translation keys
  const moods: Mood[] = [
    {
      id: 'happy',
      name: translate('music.moodHappy'),
      image: 'https://images.pexels.com/photos/1578248/pexels-photo-1578248.jpeg',
      backgroundColor: '#86efac',
    },
    {
      id: 'dreamy',
      name: translate('music.moodDreamy'),
      image: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg',
      backgroundColor: '#f9a8d4',
    },
    {
      id: 'epic',
      name: translate('music.moodEpic'),
      image: 'https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg',
      backgroundColor: '#fdba74',
    },
    {
      id: 'laid-back',
      name: translate('music.moodLaidBack'),
      image: 'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg',
      backgroundColor: '#fde047',
    },
    {
      id: 'euphoric',
      name: translate('music.moodEuphoric'),
      image: 'https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg',
      backgroundColor: '#f472b6',
    },
    {
      id: 'quirky',
      name: translate('music.moodQuirky'),
      image: 'https://images.pexels.com/photos/2103864/pexels-photo-2103864.jpeg',
      backgroundColor: '#fb923c',
    },
  ];

  return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{translate('music.moods')}</h2>
          <button className="text-gray-400 hover:text-white transition-colors">
            {translate('music.viewAllMoods')}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {moods.map((mood) => (
              <MoodCard key={mood.id} mood={mood} onClick={() => onMoodSelect(mood.id)} />
          ))}
        </div>
      </div>
  );d
};

export default MoodSection;