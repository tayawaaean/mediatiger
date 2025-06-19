export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  favorite: boolean;
  category: string[];
  music?: string;
}