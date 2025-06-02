import React from 'react';
import { UserPlus, Music, LineChart } from 'lucide-react';
import Button from '../ui/Button';

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 grid-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="neubrutalist-card text-center mb-16">
          <h2 className="neubrutalist-title">
            HOW IT<br />
            <span className="bg-blue-400">WORKS</span>
          </h2>
        </div>
        
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="neubrutalist-card">
            <div className="flex flex-col md:flex-row gap-8 items-center p-6 text-center md:text-left">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2345_Mascot%20Holding%20Number%20One_remix_01jv466zzfexxvmfgc5raethdk%20-%20Edited.png" 
                alt="Sign Up Icon"
                className="w-14 h-14"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase mb-4">
                  <span className="bg-yellow-400">Sign Up</span>
                </h3>
                <p className="font-bold mb-2">
                  Create your account and connect your YouTube channel
                </p>
              </div>
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//Screenshot%202025-05-24%20at%2010.55.14%20PM.png"
                alt="Dashboard Screenshot"
                className="w-full md:w-1/3 h-auto border-4 border-black"
              />
            </div>
          </div>
          
          <div className="neubrutalist-card">
            <div className="flex flex-col md:flex-row gap-8 items-center p-6 text-center md:text-left">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2345_Mascot%20Holding%20Two_remix_01jv4677zrf1f988tkg4xxamn8%20-%20Edited.png" 
                alt="Choose Music Icon"
                className="w-14 h-14"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase mb-4">
                  <span className="bg-pink-400">Choose Music</span>
                </h3>
                <p className="font-bold mb-2">
                  Select from our library of revenue-generating tracks and add it into your shorts video during upload.
                </p>
              </div>
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//IMG_16CC1A73F23E-1.jpeg"
                alt="Choose Music Illustration"
                className="w-full md:w-1/3 h-auto border-4 border-black"
              />
            </div>
          </div>
          
          <div className="neubrutalist-card">
            <div className="flex flex-col md:flex-row gap-8 items-center p-6 text-center md:text-left">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2349_Mascot%20Holding%20Three_remix_01jv46dmasf9paew6dd1k1rgfh%20-%20Edited.png" 
                alt="Earn More Icon"
                className="w-14 h-14"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase mb-4">
                  <span className="bg-blue-400">Earn More</span>
                </h3>
                <p className="font-bold mb-2">
                  Start earning additional revenue from your shorts
                </p>
              </div>
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//Screenshot%202025-05-25%20at%2012.27.40%20PM.png"
                alt="Earn More Illustration"
                className="w-full md:w-1/3 h-auto border-4 border-black"
              />
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <Button size="large" color="yellow">
            START EARNING NOW
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;