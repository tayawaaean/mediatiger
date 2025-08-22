import React from "react";
import {
  useScrollAnimation,
  useStaggeredAnimation,
} from "../hooks/useScrollAnimation";

const SignUp: React.FC = () => {
  const { elementRef: sectionRef, animationClasses: sectionClasses } =
    useScrollAnimation({
      animationType: "fadeIn",
      delay: 200,
      duration: 800,
    });

  const { containerRef: stepsRef, getItemClasses } = useStaggeredAnimation(
    3,
    300
  );

  return (
    <div
      ref={sectionRef}
      className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 md:py-20 overflow-hidden  ${sectionClasses}`}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-200">
        <div className="text-center">
          {/* Main heading with premium luxury styling */}
          <h2 className="relative inline-block mb-8 md:mb-4">
            <span className="text-3xl md:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 tracking-tight leading-tight drop-shadow-2xl">
              How It Works
            </span>

            {/* Multiple glowing underline effects for luxury */}
            <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full shadow-xl shadow-amber-500/50"></div>
            <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 rounded-full shadow-md shadow-yellow-400/30"></div>

            {/* Premium glow effects with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 blur-2xl -z-10 animate-pulse"></div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 via-amber-300/15 to-yellow-400/15 blur-xl -z-10 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            {/* Luxury sparkle effects */}
            <div className="absolute -top-3 -left-3 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
            <div
              className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute -bottom-4 left-6 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping opacity-40"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute -bottom-3 -right-3 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-55"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </h2>
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Identical gradient overlays as HowItWorks for seamless transition */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-900/20 via-transparent to-yellow-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>

        {/* Identical animated geometric shapes for visual continuity */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Identical additional luxury elements */}
        <div
          className="absolute top-20 left-1/4 w-48 h-48 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/4 w-56 h-56 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Identical premium grid pattern with luxury colors */}
        <div className="absolute inset-0 opacity-8">
          <div className="h-full w-full bg-[linear-gradient(to_right,#f59e0b40_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b40_1px,transparent_1px)] bg-[size:8rem_8rem]"></div>
        </div>

        {/* Identical luxury shimmer effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse"
          style={{ animationDuration: "3s" }}
        ></div>

        {/* Additional luxury overlay for seamless blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-900/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Sign Up Section */}
      <div
        ref={stepsRef}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20 z-10"
      >
        <div className={`${getItemClasses(0)} mb-12 md:mb-20`}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 text-center lg:text-left">
            {/* Mascot Image */}
            <div className="flex-shrink-0 order-1 lg:order-1">
              <img
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2345_Mascot%20Holding%20Number%20One_remix_01jv466zzfexxvmfgc5raethdk%20-%20Edited.png"
                alt="MediaTiger Mascot"
                className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain drop-shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Text Content */}
            <div className="flex-shrink-0 order-2 lg:order-2 max-w-md lg:max-w-none">
              <h3 className="relative inline-block mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 tracking-tight leading-tight">
                  Sign Up
                </span>

                {/* Smaller underline effect to show it's subcontent */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full shadow-lg shadow-amber-400/40"></div>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-400/20 blur-2xl -z-10 animate-pulse"></div>
              </h3>

              {/* Subtext with subcontent styling */}
              <div className="max-w-sm mx-auto lg:mx-0">
                <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal drop-shadow-glow-subtle animate-glow">
                  Create your account and connect your YouTube channel
                </p>
              </div>
            </div>

            {/* Screenshot */}
            <div className="flex-shrink-0 order-3 lg:order-3">
              <img
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//Screenshot%202025-05-24%20at%2010.55.14%20PM.png"
                alt="Sign Up Interface"
                className="w-48 h-auto md:w-64 lg:w-80 object-contain drop-shadow-2xl rounded-lg mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Choose Music Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className={`${getItemClasses(1)} mb-12 md:mb-20`}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 text-center lg:text-left">
            {/* Mascot Image */}
            <div className="flex-shrink-0 order-1 lg:order-1">
              <img
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2345_Mascot%20Holding%20Two_remix_01jv4677zrf1f988tkg4xxamn8%20-%20Edited.png"
                alt="MediaTiger Mascot with Number Two"
                className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain drop-shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Text Content */}
            <div className="flex-shrink-0 order-2 lg:order-2 max-w-md lg:max-w-none">
              <h3 className="relative inline-block mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 tracking-tight leading-tight">
                  Choose Music
                </span>

                {/* Same underline effect */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full shadow-lg shadow-amber-400/40"></div>

                {/* Same subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-400/20 blur-2xl -z-10 animate-pulse"></div>
              </h3>

              {/* Subtext with same styling */}
              <div className="max-w-sm mx-auto lg:mx-0">
                <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal drop-shadow-glow-subtle animate-glow">
                  Select from our library of revenue-generating tracks and add
                  it to your Shorts video during upload.
                </p>
              </div>
            </div>

            {/* Screenshot */}
            <div className="flex-shrink-0 order-3 lg:order-3">
              <img
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//IMG_16CC1A73F23E-1.jpeg"
                alt="Music Selection Interface"
                className="w-48 h-auto md:w-64 lg:w-80 object-contain drop-shadow-2xl rounded-lg mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Earn More Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className={`${getItemClasses(2)}`}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 text-center lg:text-left">
            {/* Mascot Image */}
            <div className="flex-shrink-0 order-1 lg:order-1">
              <img
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//20250512_2349_Mascot%20Holding%20Three_remix_01jv46dmasf9paew6dd1k1rgfh%20-%20Edited.png"
                alt="MediaTiger Mascot with Number Three"
                className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain drop-shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Text Content */}
            <div className="flex-shrink-0 order-2 lg:order-2 max-w-md lg:max-w-none">
              <h3 className="relative inline-block mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 tracking-tight leading-tight">
                  Earn More
                </span>

                {/* Same underline effect */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full shadow-lg shadow-amber-400/40"></div>

                {/* Same subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-400/20 blur-2xl -z-10 animate-pulse"></div>
              </h3>

              {/* Subtext with same styling */}
              <div className="max-w-sm mx-auto lg:mx-0">
                <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal drop-shadow-glow-subtle animate-glow">
                  Start earning additional revenue from your shorts
                </p>
              </div>
            </div>

            {/* Screenshot */}
            <div className="flex-shrink-0 order-3 lg:order-3">
              <img
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//Screenshot%202025-05-25%20at%2012.27.40%20PM.png"
                alt="Earnings Interface"
                className="w-48 h-auto md:w-64 lg:w-80 object-contain drop-shadow-2xl rounded-lg mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
