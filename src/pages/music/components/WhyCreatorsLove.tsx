import React from "react";
import {
  DollarSign,
  Music,
  BarChart3,
  Workflow,
  Palette,
  Headphones,
} from "lucide-react";
import {
  useScrollAnimation,
  useStaggeredAnimation,
} from "../hooks/useScrollAnimation";

interface BenefitItemProps {
  icon: React.ReactNode;
  text: string;
  index: number;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text, index }) => (
  <div
    className="group flex items-start space-x-4 p-12 py-6 w-fit rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 hover:bg-slate-700/40 hover:shadow-2xl hover:shadow-indigo-500/10 transform hover:scale-[1.02]"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Icon container with premium styling */}
    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110">
      <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>

    {/* Text content */}
    <div className="flex-1">
      <p className="text-slate-200 text-lg leading-relaxed font-medium group-hover:text-white transition-colors duration-300">
        {text}
      </p>
    </div>

    {/* Hover indicator */}
    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const WhyCreatorsLove: React.FC = () => {
  const { elementRef: sectionRef, animationClasses: sectionClasses } =
    useScrollAnimation({
      animationType: "fadeIn",
      delay: 200,
      duration: 800,
    });

  const { elementRef: headerRef, animationClasses: headerClasses } =
    useScrollAnimation({
      animationType: "scale",
      delay: 400,
      duration: 800,
    });

  const { containerRef: benefitsRef, getItemClasses } = useStaggeredAnimation(
    6,
    150
  );

  const { elementRef: ctaRef, animationClasses: ctaClasses } =
    useScrollAnimation({
      animationType: "fadeIn",
      delay: 800,
      duration: 800,
    });

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      text: "Immediate increase in revenue with zero extra work",
    },
    {
      icon: <Music className="w-6 h-6" />,
      text: "Access to exclusive, high-quality music library",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      text: "Detailed analytics dashboard to track earnings",
    },
    {
      icon: <Workflow className="w-6 h-6" />,
      text: "Seamless integration with existing content workflow",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      text: "Custom music creation available on request",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      text: "Expert support team available for all partners",
    },
  ];

  return (
    <div
      ref={sectionRef}
      className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 overflow-hidden ${sectionClasses}`}
    >
      {/* Premium background elements */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-900/20 via-transparent to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>

        {/* Animated geometric shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Additional luxury elements */}
        <div
          className="absolute top-20 left-1/4 w-48 h-48 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/4 w-56 h-56 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Premium grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(to_right,#6366f180_1px,transparent_1px),linear-gradient(to_bottom,#6366f180_1px,transparent_1px)] bg-[size:6rem_6rem]"></div>
        </div>

        {/* Luxury shimmer effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/5 to-transparent animate-pulse"
          style={{ animationDuration: "3s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerClasses}`}>
          <h2 className="relative inline-block mb-6 ">
            <span className="text-4xl md:text-6xl  gap-4 font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-indigo-300 tracking-tight leading-tight drop-shadow-2xl">
              <span>Why Creators Love</span>{" "}
              <span className="font-black text-transparent bg-clip-text h-full bg-gradient-to-r from-white via-slate-100 to-white">
                MediaTiger
              </span>
            </span>

            {/* Glowing underline effects */}
            <div className="absolute -bottom-3.5 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-full shadow-xl shadow-indigo-500/50"></div>
            <div className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-300 rounded-full shadow-md shadow-purple-400/30"></div>

            {/* Premium glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-400/20 to-indigo-500/20 blur-2xl -z-10 animate-pulse"></div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/15 via-indigo-300/15 to-purple-400/15 blur-xl -z-10 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            {/* Sparkle effects */}
            <div className="absolute -top-3 -left-3 w-2 h-2 bg-indigo-300 rounded-full animate-ping opacity-60"></div>
            <div
              className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute -bottom-4 left-6 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping opacity-40"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute -bottom-3 -right-3 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-55"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </h2>
        </div>

        {/* Benefits grid */}
        <div
          ref={benefitsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[70%] mx-auto"
        >
          {benefits.map((benefit, index) => (
            <div key={index} className={getItemClasses(index)}>
              <BenefitItem
                icon={benefit.icon}
                text={benefit.text}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div ref={ctaRef} className={`text-center mt-16 ${ctaClasses}`}>
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-full shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 group">
            <span className="text-slate-300 font-medium text-lg mr-3 group-hover:text-white transition-colors">
              Join thousands of successful creators
            </span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-slate-900 via-indigo-50/5 dark:via-slate-800/30 to-transparent"></div>

      {/* Additional luxury overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-900/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default WhyCreatorsLove;
