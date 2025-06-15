export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  favorite: boolean;
  category: string[];
}

export const musicData: MusicItem[] = [
  {
    id: 'KRMIM2515371',
    title: 'Simple Joys...',
    artist: 'Serene Sounds',
    cover: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '3:45',
    favorite: false,
    category: ['Relaxing', 'Peaceful']
  },
  {
    id: 'KRMIM2515370',
    title: 'Village Stroll',
    artist: 'Smooth Trio',
    cover: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '4:12',
    favorite: false,
    category: ['Relaxing', 'Lovely']
  },
  {
    id: 'KRMIM2515369',
    title: 'Serenity in Bloom',
    artist: 'Nature Sounds',
    cover: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '5:32',
    favorite: false,
    category: ['Relaxing', 'Peaceful']
  },
  {
    id: 'KRMIM2515336',
    title: 'Eternal Farewell',
    artist: 'Cosmic Melodies',
    cover: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '5:15',
    favorite: false,
    category: ['Dreamy', 'Mysterious']
  },
  {
    id: 'KRMIM2515335',
    title: 'Awakening Dreams...',
    artist: 'Synth Masters',
    cover: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '3:28',
    favorite: false,
    category: ['Romantic', 'Refreshing']
  },
  {
    id: 'KRMIM2515334',
    title: 'Lingering Hopes',
    artist: 'Lofi Collective',
    cover: 'https://images.pexels.com/photos/230795/pexels-photo-230795.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '4:05',
    favorite: false,
    category: ['Gloomy', 'Dreamy']
  },
  {
    id: 'KRMIM2515295',
    title: 'Breathless',
    artist: 'Coastal Sounds',
    cover: 'https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '6:22',
    favorite: false,
    category: ['Sad', 'Wistful']
  },
  {
    id: 'KRMIM2515294',
    title: 'Escape Realm...',
    artist: 'City Life',
    cover: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=100',
    duration: '3:47',
    favorite: false,
    category: ['Horror', 'Determined']
  }
];