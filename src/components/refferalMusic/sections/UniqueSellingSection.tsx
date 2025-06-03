import React from 'react';
import Button from '../ui/Button';

const UniqueSellingSection = () => {
  return (
    <section id="uniqueness" className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="neubrutalist-card text-center mb-6">
          <h3 className="text-2xl font-black uppercase mb-4">
            OUR<br />
            <span className="bg-yellow-400">MISSION</span>
          </h3>
          <p className="text-lg font-bold">
            Short Form is the future, and we make sure you get paid more for your hard work!
          </p>
        </div>
        
        <div className="neubrutalist-card text-center">
          <h3 className="text-2xl font-black uppercase mb-4">
            READY TO<br />
            <span className="bg-pink-400">EARN MORE?</span>
          </h3>
          <Button size="large" color="yellow">
            JOIN NOW
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UniqueSellingSection;