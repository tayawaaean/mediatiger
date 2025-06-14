import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HeroProps, StatsData, LoadingState } from "../types";
import VideoModal from "./VideoModal";
import { useVideoModal } from "../hooks/useVideoModal";

const AnimatedIcon: React.FC<{
  children: React.ReactNode;
  className: string;
  isPageLoaded: boolean;
}> = ({ children, className, isPageLoaded }) => (
  <div className={className}>{children}</div>
);

const StatsItem: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
      {value}
    </div>
    <div className="text-slate-600 dark:text-slate-400 mt-1">{label}</div>
  </div>
);

const Hero: React.FC<HeroProps & { loadingState: LoadingState }> = ({
  isPageLoaded,
  loadingState,
}) => {
  const { isVideoModalOpen, openVideoModal, closeVideoModal } = useVideoModal();

  const statsData: StatsData = {
    countries: "50+",
    creators: "1K+",
    contentItems: "100k+",
    paidOut: "$1M+",
  };

  const videoUrl =
    "https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/sign/videos/freecompress-mediatiger%20music%20revenue%20new..mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMjIwY2U2Mi0zNDQwLTQyNjAtOTZjNy04MGQ2YWYzZTY2NDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvZnJlZWNvbXByZXNzLW1lZGlhdGlnZXIgbXVzaWMgcmV2ZW51ZSBuZXcuLm1wNCIsImlhdCI6MTc0OTcxNDY4NSwiZXhwIjoxNzgxMjUwNjg1fQ.cXohIdYwR38Mu_ZIy5h5UsVa0hBvD85fRqxEdU-3T8U";

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-40 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

          {/* Animated grid lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[linear-gradient(to_right,#6366f180_1px,transparent_1px),linear-gradient(to_bottom,#6366f180_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>
        </div>

        <div
          className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex flex-col justify-center text-center z-10 transition-all duration-1000 ease-out ${
            loadingState.isHeroLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative">
            <h1
              className={`text-4xl md:text-6xl font-bold mb-8 relative transition-all duration-1000 ease-out ${
                loadingState.isHeroLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <span className="text-white">
                Turn Your{" "}
                <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg shadow-2xl ring-1 ring-purple-400/30 transform -rotate-1 font-bold hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                  YouTube
                </span>{" "}
                Shorts
              </span>
              <br />
              <span className="text-white">Into a New Revenue Stream</span>

              {/* Animated checkmark */}
              <AnimatedIcon
                className="absolute -top-10 -left-10 w-20 h-20 text-indigo-500/20 dark:text-indigo-400/20 transform rotate-12"
                isPageLoaded={isPageLoaded}
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="75"
                    strokeDashoffset="75"
                    className={`${
                      isPageLoaded ? "animate-[dash_2s_ease-out_forwards]" : ""
                    }`}
                  />
                  <path
                    d="M8.5 12.5L10.5 14.5L15.5 9.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="20"
                    strokeDashoffset="20"
                    className={`${
                      isPageLoaded
                        ? "animate-[dash_2s_ease-out_0.7s_forwards]"
                        : ""
                    }`}
                  />
                </svg>
              </AnimatedIcon>

              {/* Animated cube */}
              <AnimatedIcon
                className="absolute -bottom-5 -right-10 w-16 h-16 text-purple-500/20 dark:text-purple-400/20 transform -rotate-12"
                isPageLoaded={isPageLoaded}
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 7.5L12 2L3 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="30"
                    strokeDashoffset="30"
                    className={`${
                      isPageLoaded
                        ? "animate-[dash_1.5s_ease-in-out_0.2s_forwards]"
                        : ""
                    }`}
                  />
                  <path
                    d="M21 7.5V16.5L12 22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="30"
                    strokeDashoffset="30"
                    className={`${
                      isPageLoaded
                        ? "animate-[dash_1.5s_ease-in-out_0.5s_forwards]"
                        : ""
                    }`}
                  />
                  <path
                    d="M12 22L3 16.5V7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="30"
                    strokeDashoffset="30"
                    className={`${
                      isPageLoaded
                        ? "animate-[dash_1.5s_ease-in-out_0.8s_forwards]"
                        : ""
                    }`}
                  />
                  <path
                    d="M21 7.5L12 13M12 13L3 7.5M12 13V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="40"
                    strokeDashoffset="40"
                    className={`${
                      isPageLoaded
                        ? "animate-[dash_1.5s_ease-in-out_1.1s_forwards]"
                        : ""
                    }`}
                  />
                </svg>
              </AnimatedIcon>
            </h1>

            <p
              className={`text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8 transition-all duration-1000 ease-out ${
                loadingState.isHeroLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              Unlock the{" "}
              <span className="relative">
                <span className="relative z-10">full earnings potential</span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-indigo-400/30 transform -rotate-1"></span>
              </span>{" "}
              of your shorts by utilizing the{" "}
              <span className="relative">
                <span className="relative z-10">right music</span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-purple-400/30 transform rotate-1"></span>
              </span>
              . No extra work, and the{" "}
              <span className="font-bold text-indigo-400">
                easiest change ever
              </span>{" "}
              for massive benefits.
            </p>

            {/* Creator stats section */}
            <div
              className={`mb-10 transition-all px-[clamp(1rem,-4.2174rem+26.087vw,18rem)] duration-1000 ease-out ${
                loadingState.isHeroLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "700ms" }}
            >
              <p className="text-lg md:text-xl text-white font-medium">
                Over{" "}
                <span className="font-bold text-indigo-400">300 creators</span>{" "}
                are earning extra revenue every day.{" "}
                <span className="font-bold text-green-400">
                  Absolutely FREE
                </span>{" "}
                to start and earn immediately.
              </p>
            </div>

            {/* Watch How It Works Section */}
            <div
              className={`max-w-3xl mx-auto mb-12 transition-all duration-1000 ease-out ${
                loadingState.isHeroLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "900ms" }}
            >
              <div className="relative bg-slate-800/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl ring-1 ring-white/10 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="inline-block bg-indigo-500 text-white text-xl md:text-2xl font-bold px-4 py-2 rounded-lg shadow-lg ring-1 ring-indigo-400/50 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    WATCH HOW IT WORKS
                  </h2>
                </div>

                {/* Description */}
                <p className="text-base md:text-lg font-bold text-white mb-8 leading-tight">
                  See how creators are earning an extra{" "}
                  <span className="text-green-400">$5K-$20K+/MONTH</span> from
                  Shorts.
                </p>

                {/* Video placeholder with demo button */}
                <div className="relative bg-slate-700/95 backdrop-blur-sm p-10 rounded-xl shadow-inner ring-1 ring-white/10 min-h-[180px] flex items-center justify-center">
                  <button
                    onClick={openVideoModal}
                    className="relative bg-purple-500 hover:bg-purple-600 text-white text-lg md:text-xl font-bold px-8 py-4 rounded-lg shadow-xl ring-1 ring-purple-400/50 hover:shadow-2xl transition-all duration-200 transform hover:scale-105 group"
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Video
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scroll to explore more */}
            <div
              className={`flex flex-col items-center transition-all duration-1000 ease-out ${
                loadingState.isHeroLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "1100ms" }}
            >
              <div
                className="flex flex-col items-center space-y-2 group cursor-pointer"
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <p className="text-slate-300 font-medium text-sm group-hover:text-white transition-colors">
                  Scroll to explore more
                </p>
                <div className="flex flex-col items-center space-y-0.5 animate-bounce">
                  <div className="w-4 h-6 border-2 border-slate-500 rounded-full flex justify-center group-hover:border-indigo-500 transition-colors">
                    <div className="w-0.5 h-1.5 bg-slate-500 rounded-full mt-1 animate-pulse group-hover:bg-indigo-500 transition-colors"></div>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-500 group-hover:text-indigo-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        videoUrl={videoUrl}
      />
    </>
  );
};

export default Hero;
