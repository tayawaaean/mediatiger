import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FeaturesProps, Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => (
  <div
    onClick={onClick}
    className={`relative bg-slate-100 dark:bg-slate-800 p-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 ${
      !feature.comingSoon ? "cursor-pointer" : ""
    } group
      before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
      before:from-slate-100/80 before:to-slate-200/80 dark:before:from-slate-800/80 dark:before:to-slate-700/80
      before:z-[-1] before:animate-pulse before:blur-sm
      after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r
      after:from-indigo-500/20 after:via-purple-500/20 after:to-indigo-500/20
      after:z-[-1] after:blur-xl after:animate-pulse
      shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]
      transform hover:scale-105 hover:rotate-1`}
  >
    <div className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
      {feature.icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
      {feature.title}
      {feature.comingSoon ? (
        <span className="text-xs font-medium bg-amber-500/20 text-amber-500 py-1 px-2 rounded-full">
          Coming Soon
        </span>
      ) : (
        <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
      )}
    </h3>
    <p className="text-slate-600 dark:text-slate-300">
      {feature.description}
    </p>
  </div>
);

const Features: React.FC<FeaturesProps> = ({ features }) => {
  const navigate = useNavigate();

  const handleFeatureClick = (feature: Feature) => {
    if (!feature.comingSoon) {
      navigate(feature.path);
    }
  };

  return (
    <div
      id="features"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            onClick={() => handleFeatureClick(feature)}
          />
        ))}
      </div>
    </div>
  );
};

export default Features;