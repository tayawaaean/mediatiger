// components/TutorialOverlay.tsx
import React, { useEffect } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import { supabase } from '../lib/supabase'; // Adjust the import path as necessary

const TutorialOverlay: React.FC = () => {
  const {
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
  } = useTutorial();

  console.info('myconsole', 'tutorialSteps', tutorialSteps);

  useEffect(() => {
    if (!showTutorial) return;

    const updatePosition = () => {
      const elementId = tutorialSteps[currentStep].id;

      // For first-step, don't find an element or update position
      if (elementId === 'first-step') {
        setElementPosition(null); // center tooltip only
        return;
      }

      const element = document.getElementById(elementId);
      console.info('myconsole', 'element', element);

      if (element) {
        const rect = element.getBoundingClientRect();
        console.info('myconsole', 'rect', rect);
        setElementPosition(rect);
        // element.scrollIntoView({
        //   behavior: "smooth",
        //   block: "center",
        // });
      }
    };

    updatePosition();

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, showTutorial]);

  const getTooltipPosition = () => {
    const step = tutorialSteps[currentStep];
    const offset = 20;

    if (!step.position)
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    if (!elementPosition) return {};

    switch (step.position) {
      case 'top':
        return {
          top: `${elementPosition.top - offset}px`,
          left: `${elementPosition.left + elementPosition.width / 2}px`,
          transform: 'translateX(-50%) translateY(-100%)',
        };
      case 'right':
        return {
          top: `${elementPosition.top + elementPosition.height / 2}px`,
          left: `${elementPosition.right + offset}px`,
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          top: `${elementPosition.bottom + offset}px`,
          left: `${elementPosition.left + elementPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${elementPosition.top + elementPosition.height / 2}px`,
          left: `${elementPosition.left - offset}px`,
          transform: 'translateX(-100%) translateY(-50%)',
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };
  // const handlePrev = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  const handleNext = async () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { show_tutorial: false }, // Mark tutorial as shown
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }
      setActiveSection('overview');
    }
  };

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      {/* Only show highlight & overlay if not first-step */}
      {tutorialSteps[currentStep].id === 'first-step' ? (
        // Simple dark background with no highlight
        <div className="absolute inset-0 bg-black bg-opacity-70 pointer-events-none" />
      ) : (
        elementPosition && (
          <>
            {/* Dark overlay with transparent hole */}
            <div
              className="absolute inset-0 bg-black bg-opacity-70 pointer-events-none"
              style={{
                clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% ${elementPosition.top}px,
            ${elementPosition.left}px ${elementPosition.top}px,
            ${elementPosition.left}px ${
                  elementPosition.top + elementPosition.height
                }px,
            ${elementPosition.left + elementPosition.width}px ${
                  elementPosition.top + elementPosition.height
                }px,
            ${elementPosition.left + elementPosition.width}px ${
                  elementPosition.top
                }px,
            0% ${elementPosition.top}px
          )`,
              }}
            />

            {/* Highlight box */}
            <div
              className="absolute border-2 border-purple-400 rounded-md shadow-lg transition-all duration-300 pointer-events-none"
              style={{
                top: `${elementPosition.top}px`,
                left: `${elementPosition.left}px`,
                width: `${elementPosition.width}px`,
                height: `${elementPosition.height}px`,
              }}
            />
          </>
        )
      )}

      {/* Tooltip always renders */}

      <div className="absolute z-50" style={getTooltipPosition()}>
        <div
          className={`
      flex
      ${
        tutorialSteps[currentStep].position === 'top'
          ? 'flex-col items-center'
          : ''
      }
      ${
        tutorialSteps[currentStep].position === 'left'
          ? 'flex-row-reverse items-center'
          : ''
      }
      ${
        tutorialSteps[currentStep].position === 'right'
          ? 'flex-row items-center'
          : ''
      }
       ${
         tutorialSteps[currentStep].position === 'bottom'
           ? 'flex-col items-center'
           : ''
       }
      space-x-4 space-y-4
    `}
        >
          {imagesLoaded ? (
            <img
              src={tutorialSteps[currentStep].imageURL || ''}
              alt="Tiger"
              className={`
        h-32 z-10
        ${
          tutorialSteps[currentStep].position === 'top'
            ? '-mb-10'
            : tutorialSteps[currentStep].position === 'bottom'
            ? '-mb-10 -mt-5'
            : '-ml-10 -mr-10'
        }
      `}
            />
          ) : null}

          <div className="bg-[#1B103D] text-white rounded-xl shadow-xl max-w-sm p-6 relative">
            <p className="mb-4 text-lg">{tutorialSteps[currentStep].content}</p>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={buttonDisabled}
                className={`bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md transition
    ${
      buttonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
    }`}
              >
                {currentStep < tutorialSteps.length - 1 ? 'Next →' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
