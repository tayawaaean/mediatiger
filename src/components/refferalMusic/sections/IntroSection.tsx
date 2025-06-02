import React, { useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Users } from 'lucide-react';

const IntroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.2 }
    );
    
    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 grid-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="neubrutalist-card mb-12">
            <p className="text-2xl font-bold text-center">
              If you're not earning from music in your Shorts yet, you're likely leaving thousands on the table for something that takes no extra effort.
            </p>
          </div>
          
          <div className="neubrutalist-card mb-12">
            <h2 className="neubrutalist-title text-center">
              CLAIM EXTRA<br />
              <span className="bg-pink-400">REVENUE</span><br />
              NOW
            </h2>
          </div>
          
          <div className="neubrutalist-card mb-12">
            <h3 className="text-3xl font-black uppercase mb-6 text-center">
              <span className="bg-red-500 text-black">The Problem</span>
            </h3>
            <p className="text-xl font-bold text-center">
              Most YouTube creators are missing out on thousands in revenue from their Shorts, just because they're not using monetizable music.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neubrutalist-card">
              <h3 className="text-3xl font-black mb-6 uppercase">
                <span className="bg-green-400">Effortless Earning</span>
              </h3>
              <p className="text-xl font-bold">
                Adding background music onto your shorts is as simple as it can get, no other changes have to be made whatsoever to your current content.
              </p>
            </div>
            
            <div className="neubrutalist-card">
              <h3 className="text-3xl font-black mb-6 uppercase">
                <span className="bg-blue-400">Your Benefit</span>
              </h3>
              <p className="text-xl font-bold">
                You will earn extra revenue that's separate from your Adsense/Partner Program earnings because it comes directly from MediaTiger's music. No RPM impact at all, and easy additional income. 
              </p>
            </div>
            
            <div className="neubrutalist-card">
              <h3 className="text-3xl font-black mb-6 uppercase">
                <span className="bg-yellow-400">What We Do</span>
              </h3>
              <p className="text-xl font-bold">
                MediaTiger helps you claim additional YouTube Shorts revenue through music integration by utilizing multiple high end CMS.
              </p>
            </div>
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="neubrutalist-card">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//cfe2e9ab-d894-4c22-afa6-5ad39d87b3de.png" 
                alt="Partners Icon"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-2xl font-black uppercase mb-4">
                300+ Partners
              </h3>
              <p className="font-bold">
                Join our exclusive community of successful creators
              </p>
            </div>
            
            <div className="neubrutalist-card">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//payout%20-%20Edited.png" 
                alt="Extra Income Icon"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-2xl font-black uppercase mb-4">
                Extra Income
              </h3>
              <p className="font-bold">
                Don't miss out on revenue you deserve
              </p>
            </div>
            
            <div className="neubrutalist-card">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2340_Mascot%20with%20Analytics%20Chart_remix_01jv45xbrcfmps9a776wqm25a5%20-%20Edited.png" 
                alt="Track Growth Icon"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-2xl font-black uppercase mb-4">
                Track Growth
              </h3>
              <p className="font-bold">
                Monitor your earnings in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;