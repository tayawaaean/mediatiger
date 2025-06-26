// ============ FULLY FIXED OnboardingPopup.tsx ============
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleFinalSubmit,
  handleSignOut,
  showUniqueToast,
} from ".";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { Stepper } from "./Stepper";
import { isReferralUser } from "../../services/referralService";
import { supabase } from "../../lib/supabase";

interface OnboardingPopupProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly userId: string;
  readonly userEmail: string;
}

// Proper types for verification states
interface ChannelVerification {
  [key: number]: boolean | null;
}

interface VerifyingChannels {
  [key: number]: boolean;
}

export default function OnboardingPopup({
  isOpen,
  onClose,
  userId,
  userEmail,
}: OnboardingPopupProps) {
  const {
    channelInfo,
    isSubmitting,
    setChannelInfo,
    setIsSubmitting,
  } = useOnboardingStore();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isReferral, setIsReferral] = useState(false);
  
  // Referral form state - KEEPING EXACTLY THE SAME
  const [referralForm, setReferralForm] = useState({
    fullName: "",
    email: "",
    youtubeChannels: [""],
    referralCode: "",
  });

  // Channel verification state with proper typing
  const [channelVerification, setChannelVerification] = useState<ChannelVerification>({});
  const [verifyingChannels, setVerifyingChannels] = useState<VerifyingChannels>({});

  // Move useEffect to top level - always called
  useEffect(() => {
    if (user) {
      isReferralUser(user.id).then((res) => {
        setIsReferral(res);
      });
    }
  }, [user]);

  const handleChannelInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("youtubeLink")) {
      const index = parseInt(name.replace("youtubeLink", ""));
      setChannelInfo({
        ...channelInfo,
        youtubeLinks: channelInfo.youtubeLinks.map((link, i) =>
          i === index ? value : link
        ),
      });
    } else {
      setChannelInfo({ ...channelInfo, [name]: value });
    }
  };

  // KEEPING ALL REFERRAL FUNCTIONS with proper typing
  const verifyYouTubeChannel = async (url: string, index: number): Promise<void> => {
    if (!url.trim()) {
      setChannelVerification(prev => ({
        ...prev,
        [index]: null
      }));
      return;
    }

    setVerifyingChannels(prev => ({
      ...prev,
      [index]: true
    }));

    try {
      const channelMatch = url.match(/@([^/?]+)|\/channel\/([^/?]+)|\/c\/([^/?]+)|\/user\/([^/?]+)/);
      
      if (!channelMatch || !url.includes('youtube.com')) {
        setChannelVerification(prev => ({
          ...prev,
          [index]: false
        }));
        setVerifyingChannels(prev => ({
          ...prev,
          [index]: false
        }));
        return;
      }

      const { data, error } = await supabase.rpc("check_youtube_link_exists", {
        link: url,
      });

      if (error) {
        console.error("Error validating channel:", error);
        setChannelVerification(prev => ({
          ...prev,
          [index]: false
        }));
      } else {
        setChannelVerification(prev => ({
          ...prev,
          [index]: !data
        }));
      }
      
    } catch (error) {
      console.error("Error verifying channel:", error);
      setChannelVerification(prev => ({
        ...prev,
        [index]: false
      }));
    } finally {
      setVerifyingChannels(prev => ({
        ...prev,
        [index]: false
      }));
    }
  };

  // KEEPING ALL REFERRAL HANDLERS EXACTLY THE SAME
  const handleReferralFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("youtubeChannel")) {
      const index = parseInt(name.replace("youtubeChannel", ""));
      setReferralForm({
        ...referralForm,
        youtubeChannels: referralForm.youtubeChannels.map((channel, i) =>
          i === index ? value : channel
        ),
      });
      
      setTimeout(() => {
        verifyYouTubeChannel(value, index);
      }, 500);
    } else {
      setReferralForm({ ...referralForm, [name]: value });
    }
  };

  const addReferralChannelField = () => {
    setReferralForm({
      ...referralForm,
      youtubeChannels: [...referralForm.youtubeChannels, ""],
    });
  };

  const removeReferralChannelField = (index: number) => {
    setReferralForm({
      ...referralForm,
      youtubeChannels: referralForm.youtubeChannels.filter((_, i) => i !== index),
    });
    
    setChannelVerification(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setVerifyingChannels(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const validateReferralForm = (): boolean => {
    if (!referralForm.fullName.trim()) {
      showUniqueToast("Please enter your full name", "error", "fullname-required");
      return false;
    }
    if (!referralForm.email.trim()) {
      showUniqueToast("Please enter your email address", "error", "email-required");
      return false;
    }
    if (!referralForm.youtubeChannels[0]?.trim()) {
      showUniqueToast("Please enter at least one YouTube channel", "error", "youtube-required");
      return false;
    }
    
    const hasInvalidChannels = referralForm.youtubeChannels.some((channel, index) => {
      return channel.trim() && channelVerification[index] === false;
    });
    
    if (hasInvalidChannels) {
      showUniqueToast("Please fix invalid YouTube channel URLs", "error", "invalid-channels");
      return false;
    }
    
    return true;
  };

  const updateReferralId = async (referrerUsername: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('update_referral_id', {
          input_user_name: referrerUsername,
          p_user_id: userId
        });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating referral ID:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleReferralSubmit = () => {
    if (validateReferralForm()) {
      handleFinalSubmit(
        setIsSubmitting,
        [],
        userId,
        "",
        null,
        {youtubeLinks:referralForm.youtubeChannels},
        user,
        userEmail,
        onClose
      );
      updateReferralId(referralForm.referralCode, userId);
    }
  };

  // SIMPLIFIED MAIN FORM FUNCTIONS - REMOVED STEP LOGIC
  const addChannelField = () => {
    setChannelInfo({
      ...channelInfo,
      youtubeLinks: [...channelInfo.youtubeLinks, ""],
    });
  };

  const removeChannelField = (index: number) => {
    setChannelInfo({
      ...channelInfo,
      youtubeLinks: channelInfo.youtubeLinks.filter((_, i) => i !== index),
    });
  };

  // SIMPLE VALIDATION - NO STEP LOGIC
  const validateForm = (): boolean => {
    if (!channelInfo.name.trim()) {
      showUniqueToast("Please enter your name", "error", "name-required");
      return false;
    }
    if (!channelInfo.email.trim()) {
      showUniqueToast("Please enter your email", "error", "email-required");
      return false;
    }
    if (!channelInfo.youtubeLinks[0]?.trim()) {
      showUniqueToast("Please enter your YouTube channel link", "error", "youtube-required");
      return false;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {!isReferral ? (
        // SIMPLIFIED MAIN FORM - REMOVED ALL STEP LOGIC
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Floating Cubes Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={`main-cube-${i}`}
                className="absolute w-4 h-4 bg-indigo-500/10 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`,
                  transform: `rotate(45deg)`,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full flex flex-col border border-slate-700 relative z-10"
          >
            {/* Header - SIMPLIFIED */}
            <div className="bg-slate-700 px-6 py-4 flex items-center justify-center border-b border-slate-600">
              <h2 className="text-xl font-bold text-white">Welcome to MediaTiger!</h2>
            </div>

            {/* Content - SIMPLIFIED STEPPER */}
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              <Stepper
                channelInfo={{
                  ...channelInfo,
                  referralCode: channelInfo.referralCode || ""
                }}
                handleChannelInfoChange={handleChannelInfoChange}
                setChannelInfo={setChannelInfo}
                addChannelField={addChannelField}
                removeChannelField={removeChannelField}
              />
            </div>

            {/* Footer - SIMPLIFIED TO JUST SUBMIT */}
            <div className="bg-slate-700 px-6 py-4 flex justify-between items-center border-t border-slate-600 mt-auto">
              <button
                onClick={() => {
                  handleSignOut(signOut, navigate);
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
              
              {/* REMOVED CONTINUE BUTTON - ONLY SUBMIT */}
              <button
                onClick={() => {
                  if (validateForm()) {
                    handleFinalSubmit(
                      setIsSubmitting,
                      [], // No interests
                      userId,
                      "", // No other interest
                      null, // No digital rights
                      channelInfo,
                      user,
                      userEmail,
                      onClose
                    );
                  }
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        // REFERRAL FORM - KEEPING EXACTLY THE SAME
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Floating Cubes Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={`ref-cube-${i}`}
                className="absolute w-4 h-4 bg-indigo-500/10 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`,
                  transform: `rotate(45deg)`,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full flex flex-col border border-slate-700 relative z-10"
          >
            {/* Header */}
            <div className="bg-slate-700 px-6 py-4 flex items-center justify-center border-b border-slate-600">
              <h2 className="text-xl font-bold text-white">Welcome to MediaTiger!</h2>
            </div>

            {/* Referral Form Content - EXACTLY THE SAME */}
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="referral-fullName" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="referral-fullName"
                    name="fullName"
                    value={referralForm.fullName}
                    onChange={handleReferralFormChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="referral-email" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    id="referral-email"
                    name="email"
                    value={referralForm.email}
                    onChange={handleReferralFormChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* YouTube Channels */}
                <div>
                  <label htmlFor="referral-youtube" className="block text-sm font-medium text-gray-300 mb-2">
                    YouTube Channels *
                  </label>
                  {referralForm.youtubeChannels.map((channel, index) => {
                    const verificationStatus = channelVerification[index];
                    const isVerifying = verifyingChannels[index];
                    
                    return (
                      <div key={`referral-channel-${index}`} className="flex space-x-2 mb-2">
                        <div className="flex-1 relative">
                          <input
                            type="url"
                            id={index === 0 ? "referral-youtube" : undefined}
                            name={`youtubeChannel${index}`}
                            value={channel}
                            onChange={handleReferralFormChange}
                            className="w-full px-3 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://youtube.com/@yourchannel"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {isVerifying ? (
                              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : verificationStatus === true ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : verificationStatus === false ? (
                              <X className="w-4 h-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                        {referralForm.youtubeChannels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeReferralChannelField(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addReferralChannelField}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    + Add another channel
                  </button>
                </div>

                {/* Referral Code */}
                <div>
                  <label htmlFor="referral-code" className="block text-sm font-medium text-gray-300 mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    id="referral-code"
                    name="referralCode"
                    value={referralForm.referralCode}
                    onChange={handleReferralFormChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Who invited you?"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-700 px-6 py-4 flex justify-between items-center border-t border-slate-600 mt-auto">
              <button
                onClick={() => {
                  handleSignOut(signOut, navigate);
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
              <button
                onClick={handleReferralSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}