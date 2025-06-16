import React from 'react';
import { Users, Building2, Star } from 'lucide-react';

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AboutCard: React.FC<AboutCardProps> = ({ icon, title, description }) => (
  <div
    className="relative bg-slate-800 p-6 rounded-lg group
    hover:bg-slate-700 transition-all duration-300
    before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
    before:from-slate-800/80 before:to-slate-700/80
    before:z-[-1] before:animate-pulse before:blur-sm
    after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r
    after:from-indigo-500/20 after:via-purple-500/20 after:to-indigo-500/20
    after:z-[-1] after:blur-xl after:animate-pulse
    shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]
    transform hover:scale-105 hover:rotate-1"
  >
    <div className="h-12 w-12 text-indigo-500 mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-indigo-400">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">
      {title}
    </h3>
    <p className="text-slate-300">
      {description}
    </p>
  </div>
);

const About: React.FC = () => {
  const aboutData = [
    {
      icon: <Users className="h-12 w-12" />,
      title: "Our Team",
      description: "A diverse group of experts in media, technology, and content creation, working together to build the future of digital media management.",
    },
    {
      icon: <Building2 className="h-12 w-12" />,
      title: "Our Mission",
      description: "To empower creators with cutting-edge tools and technology, making media management seamless and efficient.",
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Global Impact",
      description: "Supporting creators across 50+ countries, helping them reach wider audiences and achieve their creative goals.",
    },
    {
      icon: <Star className="h-12 w-12" />,
      title: "Why Choose MediaTiger?",
      description: "At MediaTiger, the team goes up and beyond to give unique benefits found nowhere else.",
    },
  ];

  return (
    <div id="about" className="bg-slate-900 py-20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="relative inline-block text-3xl font-bold text-white mb-4 px-6 py-2
            before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
            before:from-indigo-500/10 before:via-purple-500/10 before:to-indigo-500/10
            before:z-[-1] before:animate-pulse before:blur-lg
            after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r
            after:from-indigo-500/5 after:via-purple-500/5 after:to-indigo-500/5
            after:z-[-1] after:blur-xl after:animate-pulse"
          >
            About Us
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We're a team of passionate individuals dedicated to
            revolutionizing media management for creators worldwide.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {aboutData.map((item, index) => (
            <AboutCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;