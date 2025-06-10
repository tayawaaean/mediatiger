import React from 'react';

const MusicGuideContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
        <p className="text-slate-400">
          Welcome to the Music Guide. Please review these guidelines for using music in your content.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Guidelines</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span className="text-slate-400">YouTube policies are regularly updated, so please ensure you check and comply with the latest regulations.</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span className="text-slate-400">According to YouTube policies, some audio tracks may be set to private or have usage restrictions.</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span className="text-slate-400">Unauthorized use of third-party copyrights may result in restrictions on service usage.</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span className="text-slate-400">Service usage guidelines may change depending on YouTube, distributors, or platform policies.</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span className="text-slate-400">Overlapping another music track with MediaTiger Studio audio in a video may lead to usage restrictions.</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span className="text-slate-400">Please adjust the audio volume appropriately to ensure the sound of the audio is clearly audible in the video.</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">How Is the Music Revenue On Youtube Calculated?</h3>
        <p className="text-slate-400 mb-6">
          The Revenue and RPM generated on the music is different from the Partner Program. Youtube Premium views are what allows revenue to be made on music.
        </p>

        <h4 className="text-lg font-semibold mb-3">Why You Might Have A Low RPM</h4>
        <ul className="space-y-3 text-slate-400 mb-6">
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>Your Viewer Demographics</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>What Country Your Viewer is Watching You From</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>Your video is under 35 seconds</span>
          </li>
        </ul>

        <p className="text-slate-400 mb-6">
          The younger your demographic, the more likely they don't have Youtube Premium on their accounts, resulting in a low rpm.
        </p>
        
        <p className="text-slate-400 mb-6">
          Even if a viewer watches you with Youtube Premium, they could be located in a country where the price of Youtube Premium is cheaper, for example India. India's Youtube Premium rate is around $1.50 while the US's Youtube Premium rate is around $14. You can have a lot of premium viewers from India and still have a low RPM because of that.
        </p>

        <h4 className="text-lg font-semibold mb-3">What gives you the highest RPM possible?</h4>
        <ul className="space-y-3 text-slate-400">
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>Your video is 35 seconds or over</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>You have an older demographic, they most likely watch on Youtube Premium</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>You mainly have western based viewers, from the US, UK, Australia, Canada, etc.</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent-icon mr-2">•</span>
            <span>Your retention rate on your shorts is good</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default MusicGuideContent