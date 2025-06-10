import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-10 pb-6 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <img 
          src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//tutorial%20-%20Edited%20(1).png"
          alt="Tutorial Icon"
          className="w-24 h-24 mb-2"
        />
        <h1 className="text-4xl font-bold text-primary mb-2">All Guides</h1>
        <p className="text-slate-400 text-center max-w-xl">
          Find comprehensive guides and tutorials for our platform
        </p>
      </div>
    </header>
  );
};

export default Header;