import React from 'react';
import Header from '../components/Header';
import GuidesContainer from '../components/GuidesContainer';

const Guide: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-4 md:px-8 lg:px-16 py-4 max-w-7xl mx-auto w-full">
        <GuidesContainer />
      </main>
    </div>
  );
};

export default Guide;