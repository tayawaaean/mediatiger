import React from "react";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import {
  useScrollAnimation,
  useStaggeredAnimation,
} from "../hooks/useScrollAnimation";

interface BenefitCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  titleColor: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  title,
  description,
  icon,
  titleColor,
}) => (
  <div className="relative bg-yellow-50 dark:bg-yellow-100/10 pt-16 px-8 pb-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-x-1 hover:-translate-y-1 min-h-[420px] flex flex-col">
    <div className="mb-4">
      <h3
        className={`relative text-2xl md:text-3xl lg:text-4xl font-black mb-6 tracking-tight
        before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
        before:from-white/20 before:via-transparent before:to-white/20
        before:z-[-1] before:animate-pulse before:blur-sm
        after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r
        after:from-black/10 after:via-transparent after:to-black/10
        after:z-[-1] after:blur-xl after:animate-pulse
        shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)]
        transition-all duration-300 transform hover:scale-105
        bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent
        dark:from-white dark:via-slate-100 dark:to-white
        px-2 py-1 rounded-md backdrop-blur-sm
        border border-black/20 dark:border-white/20`}
      >
        {title}
      </h3>
      <p className="text-black dark:text-white font-medium leading-relaxed text-lg md:text-xl">
        {description}
      </p>
    </div>
    {icon && (
      <div className="mt-auto flex justify-start">
        <div className="transform scale-125">{icon}</div>
      </div>
    )}
  </div>
);

const Benefits: React.FC = () => {
  const { elementRef: sectionRef, animationClasses: sectionClasses } =
    useScrollAnimation({
      animationType: "fadeIn",
      delay: 200,
      duration: 800,
    });

  const { containerRef: cardsRef, getItemClasses } = useStaggeredAnimation(
    6,
    150
  );

  const benefitsData = [
    {
      title: "EFFORTLESS EARNING",
      description:
        "Adding background music onto your shorts is as simple as it can get, no other changes have to be made whatsoever to your current content.",
      titleColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "YOUR BENEFIT",
      description:
        "You will earn extra revenue that's separate from your Adsense/Partner Program earnings because it comes directly from MediaTiger's music. No RPM impact at all, and easy additional income.",
      titleColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "WHAT WE DO",
      description:
        "MediaTiger helps you claim additional YouTube Shorts revenue through music integration from exclusive music pool contracts with YouTube for our background music tracks.",
      titleColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "300+ PARTNERS",
      description: "Join our exclusive community of successful creators",
      titleColor: "text-purple-600 dark:text-purple-400",
      icon: (
        <img
          src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//cfe2e9ab-d894-4c22-afa6-5ad39d87b3de.png"
          alt="Partners"
          className="w-20 h-20 object-contain"
        />
      ),
    },
    {
      title: "EXTRA INCOME",
      description: "Don't miss out on revenue you deserve",
      titleColor: "text-green-600 dark:text-green-400",
      icon: (
        <img
          src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//payout%20-%20Edited.png"
          alt="Extra Income"
          className="w-20 h-20 object-contain"
        />
      ),
    },
    {
      title: "TRACK GROWTH",
      description: "Monitor your earnings in real-time",
      titleColor: "text-indigo-600 dark:text-indigo-400",
      icon: (
        <img
          src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2340_Mascot%20with%20Analytics%20Chart_remix_01jv45xbrcfmps9a776wqm25a5%20-%20Edited.png"
          alt="Track Growth"
          className="w-20 h-20 object-contain"
        />
      ),
    },
  ];

  return (
    <div
      ref={sectionRef}
      id="features"
      className={`bg-white dark:bg-slate-900 py-32 scroll-mt-16 ${sectionClasses}`}
    >
      <div className="max-w-[90vw] mx-auto xl:max-w-[70vw] ">
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {benefitsData.map((benefit, index) => (
            <div key={index} className={getItemClasses(index)}>
              <BenefitCard
                title={benefit.title}
                description={benefit.description}
                titleColor={benefit.titleColor}
                icon={benefit.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
