import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle, index }) => (
  <div 
    className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:bg-slate-700/40 hover:shadow-2xl hover:shadow-indigo-500/10"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <button
      onClick={onToggle}
      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-700/20 transition-all duration-300 group"
      aria-expanded={isOpen}
    >
      <h3 className="text-lg md:text-xl font-semibold text-slate-200 group-hover:text-white transition-colors duration-300 pr-4">
        {question}
      </h3>
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110">
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>
    </button>
    
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="px-8 pb-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-4"></div>
        <p className="text-slate-300 leading-relaxed text-base md:text-lg whitespace-pre-line">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { elementRef: sectionRef, animationClasses: sectionClasses } = useScrollAnimation({
    animationType: 'fadeIn',
    delay: 200,
    duration: 800
  });

  const { elementRef: headerRef, animationClasses: headerClasses } = useScrollAnimation({
    animationType: 'scale',
    delay: 400,
    duration: 800
  });

  const { containerRef: faqRef, getItemClasses } = useStaggeredAnimation(7, 100);

  const faqData = [
    {
      question: "What Is The MediaTiger Music Program?",
      answer: "By adding licensed background music to your Shorts, creators can tap into an extra earnings stream. Each time an approved track is featured in a video, YouTube generates royalties and shares them with the creator. Unlike the standard YouTube Partner Program, this initiative offers additional income on top of your existing monetization, an effortless way to maximize rewards while continuing to create the content your audience loves."
    },
    {
      question: "What are the Splits like?",
      answer: "The revenue split is 50/50, with MediaTiger using its portion to cover expenses, YouTube fees, and operational costs. These costs are significant, reducing profit margins. However, MediaTiger is committed to prioritizing quality, even at the expense of profits. For creators surpassing 500 million views per month, a 60/40 split is available."
    },
    {
      question: "How Can I Increase Or Maximize My Youtube Shorts Revenue?",
      answer: "To maximize your revenue from YouTube Shorts, focus on three key things: consistency, audience demographics, and watch time. Posting regularly with Shorts that are at least 35 seconds long tends to perform better in terms of RPM. Creators who attract audiences from countries like the US, UK, Canada, and Australia usually see higher earnings. Using music from our approved library at a minimum of 12% volume also ensures proper tracking and monetization. The more engaging your content is, the better your retention and the higher your earnings."
    },
    {
      question: "How Do I See And Track My Earnings?",
      answer: "As soon as you begin using our music, you'll gain access to our analytics dashboard, where you can track your earnings in real time. This intuitive platform consolidates your total views, RPM, and net profit, making it easy to monitor performance. Keep in mind that YouTube's data processing introduces a 48-hour reporting delay. If you ever need support, our team is always available to assist you."
    },
    {
      question: "How Exactly Do Payments Work?",
      answer: "We handle payments through our trusted partner, Tipalti. When it's time for your payout, our finance team will guide you through the onboarding process, allowing you to select your preferred payment method, whether PayPal, wire transfer, or direct bank deposit. Payments follow a net-90 schedule, meaning your earnings are distributed 90 days after the conclusion of your first full calendar month with us. For instance, if you begin using our music in January, your initial payout will be processed in early May. For top-earning creators, we also offer an accelerated net-65 payment option."
    },
    {
      question: "Can I Use Another Background Music Along With Yours?",
      answer: "We strongly recommend using only one background track per Short, exclusively from the MediaTiger Music Library. Adding extra audio, layering multiple tracks, or increasing the volume of other music over ours will prevent monetization for that video. To keep your content eligible for earnings, ensure that our music plays at a minimum volume of 12% for at least 20 seconds. This guarantees compliance and allows our system to accurately track and monetize your Shorts."
    },
    {
      question: "Is There Any Minimum View Requirement To Join This Program?",
      answer: "MediaTiger, unlike other companies, has strict quality control and is very selective about who can join. We are strictly invite-only to filter out channels that post low-quality content, as we do not work with those types of creators."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div ref={sectionRef} id="faq" className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 overflow-hidden scroll-mt-16 ${sectionClasses}`}>
      {/* Premium background elements */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/20 via-transparent to-indigo-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>
        
        {/* Animated geometric shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional luxury elements */}
        <div className="absolute top-20 left-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Premium grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(to_right,#3b82f680_1px,transparent_1px),linear-gradient(to_bottom,#3b82f680_1px,transparent_1px)] bg-[size:6rem_6rem]"></div>
        </div>
        
        {/* Luxury shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerClasses}`}>
          <div className="flex justify-center mb-8">
            <div className="relative inline-flex items-center px-6 py-3 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full shadow-2xl">
              <HelpCircle className="w-6 h-6 text-blue-400 mr-3 animate-pulse" />
              <span className="text-blue-300 font-semibold text-lg tracking-wide">HAVE QUESTIONS?</span>
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>

          <h2 className="relative inline-block mb-6">
            <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-blue-300 tracking-tight leading-tight drop-shadow-2xl">
              Frequently Asked Questions
            </span>
            
            {/* Glowing underline effects */}
            <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-full shadow-xl shadow-blue-500/50"></div>
            <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-300 via-blue-200 to-indigo-300 rounded-full shadow-md shadow-indigo-400/30"></div>
            
            {/* Premium glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-400/20 to-blue-500/20 blur-2xl -z-10 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/15 via-blue-300/15 to-indigo-400/15 blur-xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Sparkle effects */}
            <div className="absolute -top-3 -left-3 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60"></div>
            <div className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-4 left-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-3 -right-3 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-55" style={{ animationDelay: '1.5s' }}></div>
          </h2>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Get answers to the most common questions about{" "}
            <span className="relative">
              <span className="relative z-10 font-semibold text-blue-300">MediaTiger's music program</span>
              <span className="absolute bottom-0 left-0 w-full h-2 bg-blue-500/30 transform -rotate-1 blur-sm"></span>
            </span>
            {" "}and how it can boost your earnings.
          </p>
        </div>

        {/* FAQ Items */}
        <div ref={faqRef} className="max-w-4xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className={getItemClasses(index)}>
              <FAQItem
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
              />
            </div>
          ))}
        </div>

      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-slate-900 via-blue-50/5 dark:via-slate-800/30 to-transparent"></div>
      
      {/* Additional luxury overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default FAQ;