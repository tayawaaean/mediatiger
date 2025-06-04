import { musicData, MusicItem } from "@/utils/data";
import React, { useEffect, useState } from "react";
import { CustomTrackRequest } from "../components/CustomTrackRequest";
import { FavoritesList } from "../components/FavoritesList";
import { MusicList } from "../components/MusicList";

// Define the Track interface
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number;
  image: string;
  genres: string[];
  moods: string[];
}

const MusicComponent: React.FC = () => {
  const [sortBy, setSortBy] = useState('recent')
  const [selectedMood, setSelectedMood] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMusic, setFilteredMusic] = useState(musicData)

  useEffect(() => {
    // Initialize animations
    const elements = document.querySelectorAll('.animate-slide-down, .animate-pop-in')
    elements.forEach(element => {
      requestAnimationFrame(() => {
        if (element instanceof HTMLElement) {
          element.style.opacity = ''
        }
      })
    })
  }, [])

  useEffect(() => {
    let filtered = [...musicData]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply mood filter
    if (sortBy === 'mood' && selectedMood) {
      filtered = filtered.filter(item => 
        item.category.includes(selectedMood.toLowerCase())
      )
    }
    
    setFilteredMusic(filtered)
  }, [searchTerm, sortBy, selectedMood])

  const handlePlay = (item: MusicItem) => {
    console.log('Playing:', item.title)
  }

  const handleFavorite = (id: number) => {
    const updatedMusic = musicData.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    )
    setFilteredMusic(updatedMusic)
  }

  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        <h1 className="text-3xl font-bold text-white mb-8 animate-slide-down opacity-0">
          Background Music List
        </h1>

        <div className="grid grid-cols-7 gap-6">
          {/* Left large section */}
          <div className="col-span-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 min-h-[600px] animate-section">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 w-full">
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <option value="recent">Sort by Recent</option>
                    <option value="mood">Sort by Mood</option>
                  </select>
                </div>
                
                {sortBy === 'mood' && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <option value="">Select Mood</option>
                        {/* Add your mood options here */}
                      </select>
                    </div>
                  </div>
                )}

                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 text-slate-300 rounded-full border border-slate-700/50 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <MusicList
              items={filteredMusic}
              onPlay={handlePlay}
              onFavorite={handleFavorite}
              onCopyISRC={(id) => {
                const item = musicData.find(m => m.id === id)
                if (item) {
                  navigator.clipboard.writeText(item.id.toString())
                }
              }}
            />
          </div>

          {/* Right sections */}
          <div className="col-span-3 space-y-6">
            <FavoritesList items={musicData} />
            <CustomTrackRequest />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MusicComponent;