import React from 'react';

const UploadGuideContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
        <p className="text-slate-400">
          Welcome to the upload guide. This guide will help you understand how to use this feature effectively.
        </p>
        <div className="flex flex-col gap-4 mt-6">
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//mobile%20upload%20guide.png"
            alt="Mobile Upload Guide"
            className="rounded-lg border border-border max-w-full"
          />
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//mobile%20upload%20guide%201.png"
            alt="Mobile Upload Guide Steps"
            className="rounded-lg border border-border max-w-full"
          />
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//raindash2.png"
            alt="Raindash Upload Interface"
            className="rounded-lg border border-border max-w-full"
          />
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//Untitled%20design%20(2).png"
            alt="Upload Design"
            className="rounded-lg border border-border max-w-full"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Mobile Upload Time Limits Removal</h3>
        <div className="flex flex-col gap-4">
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//timelimit.png"
            alt="Time Limit Settings"
            className="rounded-lg border border-border max-w-full"
          />
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//Raindash.png"
            alt="Raindash Interface"
            className="rounded-lg border border-border max-w-full"
          />
          <img
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//e2ee683a-bb7f-4156-b228-c5f45e26c4b0.png"
            alt="Additional Settings"
            className="rounded-lg border border-border max-w-full"
          />
        </div>
      </section>
    </div>
  );
};

export default UploadGuideContent;