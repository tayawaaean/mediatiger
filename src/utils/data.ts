export interface MusicItem {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  favorite: boolean;
  category: string[];
}

export const musicData: MusicItem[] = [
  {
    id: 1,
    title: "Ambient Dreams",
    artist: "Serene Sounds",
    cover: "https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "3:45",
    favorite: false,
    category: ["all", "mood"]
  },
  {
    id: 2,
    title: "Midnight Jazz",
    artist: "Smooth Trio",
    cover: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "4:12",
    favorite: true,
    category: ["all", "favorited", "mood"]
  },
  {
    id: 3,
    title: "Electric Waves",
    artist: "Synth Masters",
    cover: "https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "3:28",
    favorite: false,
    category: ["all", "new"]
  },
  {
    id: 4,
    title: "Peaceful Morning",
    artist: "Nature Sounds",
    cover: "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "5:32",
    favorite: true,
    category: ["all", "favorited", "mood"]
  },
  {
    id: 5,
    title: "Urban Beats",
    artist: "City Life",
    cover: "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "3:15",
    favorite: false,
    category: ["all", "new"]
  },
  {
    id: 6,
    title: "Chill Vibes",
    artist: "Lofi Collective",
    cover: "https://images.pexels.com/photos/230795/pexels-photo-230795.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "4:05",
    favorite: false,
    category: ["all", "mood"]
  },
  {
    id: 7,
    title: "Ocean Waves",
    artist: "Coastal Sounds",
    cover: "https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "6:22",
    favorite: true,
    category: ["all", "favorited"]
  },
  {
    id: 8,
    title: "Morning Coffee",
    artist: "Cafe Lounge",
    cover: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "3:47",
    favorite: false,
    category: ["all", "new"]
  },
  {
    id: 9,
    title: "Starry Night",
    artist: "Cosmic Melodies",
    cover: "https://images.pexels.com/photos/1694000/pexels-photo-1694000.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "5:15",
    favorite: false,
    category: ["all", "new", "mood"]
  },
  {
    id: 10,
    title: "Summer Breeze",
    artist: "Tropical Vibes",
    cover: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "3:32",
    favorite: true,
    category: ["all", "favorited"]
  },
  {
    id: 11,
    title: "Focus Flow",
    artist: "Deep Concentration",
    cover: "https://images.pexels.com/photos/775907/pexels-photo-775907.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "4:45",
    favorite: false,
    category: ["all", "mood"]
  },
  {
    id: 12,
    title: "Rainy Day",
    artist: "Cozy Tunes",
    cover: "https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    duration: "4:22",
    favorite: true,
    category: ["all", "favorited", "mood"]
  }
];