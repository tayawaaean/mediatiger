import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import MusicOpportunity from "./components/MusicOpportunity";
import TheProblem from "./components/TheProblem";
import Benefits from "./components/Benefits";
import WhyCreatorsLove from "./components/WhyCreatorsLove";
import FAQ from "./components/FAQ";
import OurMission from "./components/OurMission";
import SignUp from "./components/SignUp";
import Footer from "./components/Footer";
import "./index.css";

import { useLoadingAnimations } from "./hooks/useLoadingAnimations";
import { useMobileMenu } from "./hooks/useMobileMenu";
import { usePageAnimation } from "./hooks/usePageAnimation";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

const MusicPage: React.FC = () => {
  const loadingState = useLoadingAnimations();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const { isPageLoaded, triggerPageLoad } = usePageAnimation();
  const { setupSmoothScroll } = useSmoothScroll();

  React.useEffect(() => {
    setupSmoothScroll();
    const cleanup = triggerPageLoad();
    return cleanup;
  }, []);

  // Debug logging to check loading state
  React.useEffect(() => {
    console.log("Loading State:", loadingState);
  }, [loadingState]);

  return (
    <div className="min-h-screen bg-slate-900">
      <LoadingScreen
        isVisible={loadingState.isInitialLoading}
        progress={loadingState.loadingProgress}
      />

      <Toaster position="top-right" />

      <Navigation
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        loadingState={loadingState}
      />

      <Hero isPageLoaded={isPageLoaded} loadingState={loadingState} />

      <MusicOpportunity />

      <TheProblem />

      <Benefits />

      <WhyCreatorsLove />

      <SignUp />

      <FAQ />

      <OurMission />

      <Footer />
    </div>
  );
};

export default MusicPage;
