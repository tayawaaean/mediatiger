// In your AdminDashboard.jsx or similar file

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const MusicManager = () => {
  const [music, setmusic] = useState([]);

  return (
    <div className="p-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50">
      
      <div className="space-y-3">
        {music.length === 0 ? (
          <p className="text-slate-400">No music yet.</p>
        ) : (
          music.map((music) => (
            <div
              key={music.id}
              className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 flex justify-between"
            >
             
            </div>
          ))
        )}
      </div>
    </div>
  );
};
