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
  // ... rest of your music data
]