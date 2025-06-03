import React from 'react';
import { CreditCard, BanknoteIcon, CheckSquare, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FAQProps {
  question: string;
  answer: string;
}

const FAQ: React.FC<FAQProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-slide-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }

    return () => {
      if (faqRef.current) {
        observer.unobserve(faqRef.current);
      }
    };
  }, []);

  return (
    <div ref={faqRef} className="neubrutalist-card mb-4 opacity-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold"
      >
        <span>{question}</span>
        <ChevronDown
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="mt-4 pt-4 border-t-4 border-black">
          {answer}
        </div>
      )}
    </div>
  );
};

const PaymentSection = () => {
  const paymentMethods = [
    { name: 'PAYPAL', logo: '💳' },
    { name: 'ACH TRANSFER', logo: '🏦' },
    { name: 'WIRE TRANSFER', logo: '💸' },
    { name: 'CHECK', logo: '📝' },
    { name: 'DIRECT DEPOSIT', logo: '📥' },
    { name: 'eCHECK', logo: '✅' },
  ];

  return (
    <section id="payments" className="py-24 grid-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="neubrutalist-card text-center mb-16">
          <h2 className="neubrutalist-title">
            PAYMENT<br />
            <span className="bg-yellow-400">PROCESS</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="neubrutalist-card">
            <h3 className="text-3xl font-black uppercase mb-6">
              <span className="bg-pink-400">Simple Setup</span>
            </h3>
            <p className="text-xl font-bold mb-4">
              Get started with Tipalti, our secure payment portal
            </p>
            <p className="font-bold">
              Enter your tax details and banking information to start receiving payments
            </p>
          </div>
          
          <div className="neubrutalist-card">
            <h3 className="text-3xl font-black uppercase mb-6">
              <span className="bg-blue-400">Tax Compliance</span>
            </h3>
            <p className="text-xl font-bold mb-4">
              Proper documentation for your earnings
            </p>
            <p className="font-bold">
              Receive tax forms just like with YouTube Partner Program
            </p>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="neubrutalist-card">
            <h3 className="text-3xl font-black uppercase mb-8 text-center">
              <span className="bg-yellow-400">PAYMENT METHODS</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="neubrutalist-card">
                  <div className="text-4xl mb-2">{method.logo}</div>
                  <div className="font-black text-black">{method.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <div className="neubrutalist-card animate-fade-slide-in">
          <div className="flex items-center gap-4 justify-center mb-8">
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//confused%20-%20Edited.png"
              alt="Confused Mascot"
              className="w-16 h-16 transform -scale-x-100"
            />
            <h3 className="text-3xl font-black uppercase text-center">
              <span className="bg-pink-400">FREQUENTLY ASKED QUESTIONS</span>
            </h3>
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//confused%20-%20Edited.png"
              alt="Confused Mascot"
              className="w-16 h-16"
            />
          </div>
          
          <div className="max-w-3xl mx-auto">
            <FAQ 
              question="What Is The MediaTiger Music Program?"
              answer="By adding licensed background music to your Shorts, creators can tap into an extra earnings stream. Each time an approved track is featured in a video, YouTube generates royalties and shares them with the creator. Unlike the standard YouTube Partner Program, this initiative offers additional income on top of your existing monetization, an effortless way to maximize rewards while continuing to create the content your audience loves."
            />
            <FAQ 
              question="What are the Splits like?"
              answer="The revenue split is 50/50, with MediaTiger using its portion to cover expenses, YouTube fees, and operational costs. These costs are significant, reducing profit margins. However, MediaTiger is committed to prioritizing quality, even at the expense of profits. For creators surpassing 500 million views per month, a 60/40 split is available."
            />
            <FAQ 
              question="How Can I Increase Or Maximize My Youtube Shorts Revenue?"
              answer="To maximize your revenue from YouTube Shorts, focus on three key things, consistency, audience demographics, and watch time. Posting regularly with Shorts that are at least 35 seconds long tends to perform better in terms of RPM. Creators who attract audiences from countries like the US, UK, Canada, and Australia usually see higher earnings. Using music from our approved library at a minimum of 12% volume also ensures proper tracking and monetization. The more engaging your content is, the better your retention and the higher your earnings."
            />
            <FAQ 
              question="How Do I See And Track My Earnings?"
              answer="As soon as you begin using our music, you'll gain access to our analytics dashboard, where you can track your earnings in real time. This intuitive platform consolidates your total views, RPM, and net profit, making it easy to monitor performance. Keep in mind that YouTube's data processing introduces a 48 hour reporting delay. If you ever need support, our team is always available to assist you."
            />
            <FAQ 
              question="How Exactly Do Payments Work?"
              answer="We handle payments through our trusted partner, Tipalti. When it's time for your payout, our finance team will guide you through the onboarding process, allowing you to select your preferred payment method, whether PayPal, wire transfer, or direct bank deposit. Payments follow a net 90 schedule, meaning your earnings are distributed 90 days after the conclusion of your first full calendar month with us. For instance, if you begin using our music in January, your initial payout will be processed in early May. For top earning creators, we also offer an accelerated net 65 payment option."
            />
            <FAQ 
              question="Can I Use Another Background Music Along With Yours?"
              answer="We strongly recommend using only one background track per Short, exclusively from the MediaTiger Music Library. Adding extra audio, layering multiple tracks, or increasing the volume of other music over ours will prevent monetization for that video. To keep your content eligible for earnings, ensure that our music plays at a minimum volume of 12% for at least 20 seconds. This guarantees compliance and allows our system to accurately track and monetize your Shorts."
            />
            <FAQ 
              question="Is There Any Minimum View Requirement To Join This Program?"
              answer="MediaTiger, unlike other companies, has strict quality control and is very selective about who can join. We are strictly invite only to filter out channels that post low quality content, as we do not work with those types of creators."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;