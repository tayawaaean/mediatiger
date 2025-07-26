// contexts/TutorialContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  imageURL?: string;
  // centerInfo: boolean
}

interface TutorialContextType {
  tutorialSteps: TutorialStep[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  elementPosition: DOMRect | null;
  setElementPosition: (rect: DOMRect | null) => void;
  buttonDisabled: boolean;
  setActiveSection: (section: string) => void;
  imagesLoaded: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

interface TutorialProviderProps {
  children: React.ReactNode;
  user: any; // You can replace with a more specific type from Supabase
  activeSection: string;
  setActiveSection: (section: string) => void;
  showTuto: boolean;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({
  children,
  user,
  activeSection,
  setActiveSection,
  showTuto,
}) => {
  const handsbehind =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/new5.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL25ldzUucG5nIiwiaWF0IjoxNzUzNTE3MjE5LCJleHAiOjE3ODUwNTMyMTl9.tReP7dhqi1AWJd5TReyRGQrW5mkvNkPGsQtQmgE-92c';
  const backpack =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/new1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL25ldzEucG5nIiwiaWF0IjoxNzUzNTE3MTk2LCJleHAiOjE3ODUwNTMxOTZ9.mKFkcuMaLrdhTa0vquXalB5Xmm-Oe7QatdOwoMwQQQY';
  const muscular =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/new3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL25ldzMucG5nIiwiaWF0IjoxNzUzNTE3MjQwLCJleHAiOjE3ODUwNTMyNDB9.OimGKy6jLTEiBM4GeaHmoVVA9Je9YThgMkcadCes_4M';
  const pointingDown =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/new2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL25ldzIucG5nIiwiaWF0IjoxNzUzNTE3MTA3LCJleHAiOjE3ODUwNTMxMDd9.D6MwDuwI43E8IXNBsEH2RvwucybakrtFTtWWTTuz31o';
  const pointingUp =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/new4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL25ldzQucG5nIiwiaWF0IjoxNzUzNTE3Mjg2LCJleHAiOjE3ODUwNTMyODZ9._miz5155wzDwyo-cI6y7yaelb7mat7LjPyzHMXvXLbs';
  const welcome =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_1824_Mascot%20Holding%20Welcome%20Sign_remix_01jv3ktyt8evrsjcd5x71rmdcb%20-%20Edited.png';
  const pointingLeft =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/pointing%20-%20Edited.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL3BvaW50aW5nIC0gRWRpdGVkLnBuZyIsImlhdCI6MTc1MzEwNzgzMiwiZXhwIjoxNzg0NjQzODMyfQ.RLMkno04FTULXGfkQmGhjeUgjlQnRdmESU8M-eaKc3s';
  const excited =
    'https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/mascots/excited2%20-%20Edited.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZGIwODE4Yy03NDE2LTRhYjAtYTY1YS00MmMxZGJiOGVjOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXNjb3RzL2V4Y2l0ZWQyIC0gRWRpdGVkLnBuZyIsImlhdCI6MTc1MzEwNzc4MCwiZXhwIjoxNzg0NjQzNzgwfQ.xlt5nRYYggHJcbNcj9KDdAPqXuuaMBiRTGiX3ETErag';
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [elementPosition, setElementPosition] = useState<DOMRect | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'first-step',
      content:
        "Hi! I'm Ty! Welcome to MediaTiger! I'll be your personal guide for this trip. Let's go over everything shall we?",
      position: 'top',
      imageURL: welcome,
    },

    {
      id: 'dashboard-header',
      content:
        'On the corner is notifications, settings, and live chat support for any questions you have!',
      position: 'bottom',
      imageURL: pointingUp,
    },
    {
      id: 'side-bar',
      content: "Let's go over the sidebar.",
      position: 'right',
      imageURL: excited,
    },
    {
      id: 'nav-item-overview',
      content:
        'In Overview, this is the main section that shows your overall metrics.',
      position: 'right',
      imageURL: pointingLeft,
    },
    {
      id: 'nav-item-analytics',
      content:
        'In Analytics, you can see your detailed metrics and performances.',
      position: 'right',
      imageURL: pointingLeft,
    },
    {
      id: 'analytics-channel-selector',
      content:
        'You can sort the analytics to show for specific channel if you have multiple channels.',
      position: 'bottom',
      imageURL: pointingUp,
    },
    {
      id: 'analytics-date-selector',
      content: 'You can set the date to a specific time period, if needed.',
      position: 'left',
      imageURL: excited,
    },
    {
      id: 'nav-item-channels',
      content:
        'In Channel Management, you can see all of your connected channels and your affiliate channels.',
      position: 'right',
      imageURL: pointingLeft,
    },
    {
      id: 'channels-channel-view',
      content: 'You can view your channel here.',
      position: 'bottom',
      imageURL: pointingUp,
    },
    {
      id: 'channels-affiliate-view',
      content:
        'You can view your affiliate section here, along with your affiliated channels you invited.',
      position: 'top',
      imageURL: pointingDown,
    },
    {
      id: 'nav-item-music',
      content: 'In Music, you can see all of the background music you can use.',
      position: 'right',
      imageURL: pointingLeft,
    },
    {
      id: 'music-background-list',
      content:
        'You can see the list of background music here, and you can sort by recent or mood.',
      position: 'top',
      imageURL: '',
    },
    {
      id: 'music-background-request',
      content:
        'You can also request custom background music, if needed to fit your specific style of content.',
      position: 'top',
      imageURL: pointingDown,
    },

    {
      id: 'nav-item-balance',
      content:
        'In Balance, you can see your balance amount of the month, as well as your payout history.',
      position: 'right',
      imageURL: pointingLeft,
    },
    {
      id: 'balance-amount',
      content:
        "Here, you can see your balance. The amount resets to 0 once you've been paid out.",
      position: 'bottom',
      imageURL: pointingUp,
    },
    {
      id: 'nav-item-guides',
      content:
        'In Guide, you can see detailed explanations about how to use the music in the Youtube App, if you are need more clarifications.',
      position: 'right',
      imageURL: pointingLeft,
    },
    {
      id: 'first-step',
      content:
        'We can also assist you on maximizing this opportunity, giving you tips and advices on your specific channel.',
      position: 'top',
      imageURL: muscular,
    },
    {
      id: 'first-step',
      content:
        'If you have any questions beyond the guide given, feel free to contact the support team through the live chat.',
      position: 'top',
      imageURL: handsbehind,
    },
    {
      id: 'first-step',
      content:
        "And that's it, you are all set. Go make some more short form content, do what you do, and make more money. Good luck!",
      position: 'top',
      imageURL: backpack,
    },
  ];

  useEffect(() => {
    const preloadTutorialImages = async () => {
      const promises = tutorialSteps.map((step) => {
        return new Promise<void>((resolve) => {
          if (!step.imageURL) {
            resolve(); // Skip if no image
            return;
          }

          const img = new Image();
          img.src = step.imageURL;
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn('Failed to load image:', step.imageURL);
            resolve(); // still resolve to prevent blocking
          };
        });
      });

      await Promise.all(promises);
      setImagesLoaded(true);
    };

    preloadTutorialImages();
  }, []);

  useEffect(() => {
    const str = tutorialSteps[currentStep].id;
    const result = str.split('-').pop(); // e.g., "music"
    setButtonDisabled(true);

    const allowedSections = [
      'channels',
      'balance',
      'analytics',
      'music',
      'guides',
    ];

    if (result && allowedSections.includes(result)) {
      setActiveSection(result);

      // Temporarily disable button for 800ms
    } else {
      console.warn('Invalid or missing section:', result);
    }

    const timeout = setTimeout(() => {
      setButtonDisabled(false);
    }, 1000);

    return () => clearTimeout(timeout); // Cleanup if component unmounts or updates
  }, [currentStep]);

  useEffect(() => {
    const updateTutorialState = async () => {
      if (!showTuto) return;
      if (!user) return;

      try {
        const showTutorialPreference = user.user_metadata?.show_tutorial;

        if (
          showTutorialPreference === undefined ||
          showTutorialPreference === true
        ) {
          setShowTutorial(true); // show it
        } else {
          // Don't show again
          setShowTutorial(false);
        }
      } catch (err) {
        console.error('Failed to update tutorial state:', err);
      }
    };

    updateTutorialState();
  }, [user, showTuto]);

  return (
    <TutorialContext.Provider
      value={{
        tutorialSteps,
        currentStep,
        setCurrentStep,
        showTutorial,
        setShowTutorial,
        elementPosition,
        setElementPosition,
        buttonDisabled,
        setActiveSection,
        imagesLoaded,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context)
    throw new Error('useTutorial must be used within a TutorialProvider');
  return context;
};
