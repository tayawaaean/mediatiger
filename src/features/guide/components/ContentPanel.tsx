import React from 'react';
import UploadGuideContent from './UploadGuideContent';
import MusicGuideContent from './MusicGuideContent';
import PaymentsGuideContent from './PaymentsGuideContent';

interface ContentPanelProps {
  activeGuide: string;
}

const ContentPanel: React.FC<ContentPanelProps> = ({ activeGuide }) => {
  const renderContent = () => {
    switch (activeGuide) {
      case 'upload':
        return <UploadGuideContent />;
      case 'music':
        return <MusicGuideContent />;
      case 'payments':
        return <PaymentsGuideContent />;
      case 'quick-start':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3">Dashboard Overview</h3>
              <p className="text-slate-400 mb-6">
                The dashboard is your central hub for managing your content and tracking performance. Here's what you'll find in each section:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-2">Overview</h4>
                  <p className="text-slate-400">
                    View your overall metrics, set monthly goals, check announcements, manage notifications, adjust settings, and access your personal live support chat.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Analytics</h4>
                  <p className="text-slate-400">
                    Access detailed analytics for your channels, including views, RPM, and earning amounts.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Channel Management</h4>
                  <p className="text-slate-400">
                    Manage your current channels and view affiliate channels (those who signed up with your referral code).
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Music</h4>
                  <p className="text-slate-400">
                    Browse the comprehensive list of background music and request custom background music.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Balance</h4>
                  <p className="text-slate-400">
                    Monitor your balance amount and review your payout history.
                  </p>
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return <div className="p-6">Select a guide to view its content</div>;
    }
  };

  return (
    <div className="w-full bg-slate-800/90 rounded-2xl border border-indigo-500/20 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          {activeGuide === 'upload' && (
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//416c9dfd-03ad-4e5b-b87c-c56228305b89.png"
              alt="Upload Guide Icon"
              className="w-12 h-12 object-contain"
            />
          )}
          {activeGuide === 'music' && (
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//music%20-%20Edited.png"
              alt="Music Guide Icon"
              className="w-12 h-12 object-contain"
            />
          )}
          {activeGuide === 'payments' && (
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//Untitled%20design%20(1).png"
              alt="Payments Guide Icon"
              className="w-12 h-12 object-contain"
            />
          )}
          {activeGuide === 'quick-start' && (
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//979647a0-3ec7-4fb7-8fb4-e37ecc00bd87.png"
              alt="Quick Start Guide Icon"
              className="w-12 h-12 object-contain"
            />
          )}
          <h2 className="text-2xl font-semibold">
            {activeGuide === 'upload' && 'Upload Guide'}
            {activeGuide === 'music' && 'Music Guide'}
            {activeGuide === 'payments' && 'How to Setup Payments'}
            {activeGuide === 'quick-start' && 'Quick Start Guide'}
          </h2>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentPanel;