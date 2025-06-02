import React, { useEffect, useState } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/routeConstants';

const VIDEO_URL = "https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/videos/freecompress-mediatiger%20music%20revenue%20new..mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2IyMjBjZTYyLTM0NDAtNDI2MC05NmM3LTgwZDZhZjNlNjY0OCJ9.eyJ1cmwiOiJ2aWRlb3MvZnJlZWNvbXByZXNzLW1lZGlhdGlnZXIgbXVzaWMgcmV2ZW51ZSBuZXcuLm1wNCIsImlhdCI6MTc0ODU0NjIzNywiZXhwIjoxNzgwMDgyMjM3fQ.jEAQtU3X6EPuJEsdIVywQ4TZzq40rlYhHMs6hmEeCWQ";

const navigationItems = [
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Payments', href: '#payments' },
];

const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  return (
    <section className="pt-4 sm:pt-8 pb-8 sm:pb-12 grid-pattern">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-8 fade-in-element">
          <div className="neubrutalist-card fade-in-child">
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//39888c2f-22d0-4a95-85ae-dfa6dc1aae7b.png"
              alt="MediaTiger Logo"
              className="h-12 sm:h-16 w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
          <div className="neubrutalist-card fade-in-element stagger-animation">
            <h3 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 uppercase">
              Turn Your Youtube <span className="typing-animation"></span> Into A New Revenue Stream
            </h3>

            <p className="text-xl sm:text-2xl mb-6 sm:mb-8 font-bold">
              MediaTiger allows creators to unlock the full earnings potential of their shorts by utilizing the right music. No extra work, and the easiest change ever.
            </p>

            <p className="text-xl sm:text-2xl mb-6 sm:mb-8 font-bold">
              Over 300 creators are earning extra revenue every day. Absolutely FREE to start and earn immediately.
            </p>

            <div className="mt-8">
              <Button onClick={() => {
                navigate(`${ROUTES.SIGNUP}?referal=true`);
              }} size="large" color="yellow" className="w-full">
                GET STARTED NOW!
              </Button>
            </div>
          </div>
          
          {/* Video section */}
          <div className="neubrutalist-card fade-in-element stagger-animation">
            <h3 className="text-3xl font-black mb-6 uppercase">
              <span className="bg-blue-400">Watch How It Works</span>
              <p className="text-xl font-bold mt-2">See how creators are earning an extra $5K–$20K/month from Shorts.</p>
            </h3>
            <div className="border-4 border-black aspect-video relative overflow-hidden bg-[#FFFDD0]">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                controls={isPlaying}
                preload="metadata"
                onLoadedData={handleLoadedData}
              >
                <source
                  src={VIDEO_URL}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-[#FFFDD0] cursor-pointer"
                  onClick={handlePlayClick}
                >
                  <button className="neubrutalist-button bg-pink-400">Watch Demo</button>
                </div>
              )}
            </div>
          </div>
        </div>
          
        <div className="mt-8 flex justify-center fade-in-element">
          <div className="neubrutalist-card inline-block">
            <p className="text-xl font-bold">Scroll to explore more</p>
            <div className="animate-bounce-slow mt-2 flex justify-center">
              <ChevronDown size={24} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;