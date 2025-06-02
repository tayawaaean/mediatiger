import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleCopyVerification,
  handleFinalSubmit,
  handleSignOut,
  handleSubmitInterests,
  showUniqueToast,
  verifyChannel,
} from ".";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { Stepper } from "./Stepper";
import { isReferralUser } from "../../services/referralService";
import { supabase } from "../../lib/supabase";
interface OnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export default function OnboardingPopup({
  isOpen,
  onClose,
  userId,
  userEmail,
}: OnboardingPopupProps) {
  const {
    step,
    interests,
    otherInterest,
    digitalRightsInfo,
    channelInfo,
    isVerifying,
    isSubmitting,
    verificationCopied,
    setStep,
    setInterests,
    setOtherInterest,
    setDigitalRightsInfo,
    setChannelInfo,
    setIsVerifying,
    setIsSubmitting,
    setVerificationCopied,
  } = useOnboardingStore();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isReferral, setIsReferral] = useState(false);
  
  // Referral form state
  const [referralForm, setReferralForm] = useState({
    fullName: "",
    email: "",
    youtubeChannels: [""],
    referralCode: "",
  });

  // Channel verification state
  const [channelVerification, setChannelVerification] = useState({});
  const [verifyingChannels, setVerifyingChannels] = useState({});

  React.useEffect(() => {
    if (!channelInfo.verificationCode) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      setChannelInfo((prev) => ({ ...prev, verificationCode: code }));
    }
  }, [channelInfo]);

  const handleInterestChange = (interest: keyof typeof interests) => {
    const newInterests = { ...interests, [interest]: !interests[interest] };
    setInterests(newInterests);

    // Clear YouTube links if both channelManagement and musicPartnerProgram are deselected
    if (!newInterests.channelManagement && !newInterests.musicPartnerProgram) {
      setChannelInfo((prev) => ({
        ...prev,
        youtubeLinks: [""],
        verifiedChannels: {},
      }));
    }
  };

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

  // Verify YouTube channel exists
  const verifyYouTubeChannel = async (url, index) => {
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
      // Extract channel handle or ID from URL
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

      // Check if channel exists using your Supabase function
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
        // If data is true, channel already exists (error case)
        // If data is false, channel is available (success case)
        setChannelVerification(prev => ({
          ...prev,
          [index]: !data // Invert because data=true means already exists
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
  // Referral form handlers
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
      
      // Verify channel after a short delay
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
    
    // Clean up verification state for removed channel
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

  const validateReferralForm = () => {
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
    
    // Check if any channels are invalid
    const hasInvalidChannels = referralForm.youtubeChannels.some((channel, index) => {
      return channel.trim() && channelVerification[index] === false;
    });
    
    if (hasInvalidChannels) {
      showUniqueToast("Please fix invalid YouTube channel URLs", "error", "invalid-channels");
      return false;
    }
    
    return true;
  };
// Create the function call
const updateReferralId = async (referrerUsername, userId) => {
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
  } catch (error) {
    console.error('Error updating referral ID:', error?.message);
    return { success: false, error: error?.message };
  }
};

// Usage example
 
  const handleReferralSubmit = () => {
    if (validateReferralForm()) {
      // Handle referral form submission here
      handleFinalSubmit(
        setIsSubmitting,
        [],
        userId,
        "",
        {},
        {youtubeLinks:referralForm.youtubeChannels},
        user,
        userEmail,
        onClose
      );
      updateReferralId(referralForm.referralCode, userId);
      // You can add your submission logic here
  //    onClose();
    }
  };

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

  const validateStep2 = () => {
    if (!channelInfo.name.trim()) {
      showUniqueToast("Please enter your name", "error", "name-required");
      return false;
    }
    if (!channelInfo.email.trim()) {
      showUniqueToast("Please enter your email", "error", "email-required");
      return false;
    }
    if (!channelInfo.youtubeLinks[0]?.trim()) {
      showUniqueToast(
        "Please enter your YouTube channel link",
        "error",
        "youtube-required"
      );
      return false;
    }
    return true;
  };

  if (!isOpen) return null;
  
  useEffect(() => {
    if (user) {
      isReferralUser(user.id).then((res) => {
        setIsReferral(res);
      });
    }
  }, [user]);

  return (
    <AnimatePresence mode="wait">
      {!isReferral ? (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Floating Cubes Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
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
              <h2 className="text-xl font-bold text-white">
                {step === 1 ? "Welcome to MediaTiger!" : "Channel Information"}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              <Stepper
                step={step}
                interests={interests}
                channelInfo={channelInfo}
                digitalRightsInfo={digitalRightsInfo}
                otherInterest={otherInterest}
                isVerifying={isVerifying}
                verificationCopied={verificationCopied}
                user={user}
                handleInterestChange={handleInterestChange}
                handleChannelInfoChange={handleChannelInfoChange}
                setDigitalRightsInfo={setDigitalRightsInfo}
                setOtherInterest={setOtherInterest}
                addChannelField={addChannelField}
                removeChannelField={removeChannelField}
                handleCopyVerification={handleCopyVerification}
                setIsVerifying={setIsVerifying}
                setChannelInfo={setChannelInfo}
                verifyChannel={verifyChannel}
                setVerificationCopied={setVerificationCopied}
              />
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
              {step === 1 ? (
                <button
                  onClick={() => {
                    handleSubmitInterests(
                      interests,
                      otherInterest,
                      channelInfo,
                      digitalRightsInfo,
                      setStep,
                      user,
                      onClose,
                      setIsSubmitting
                    );
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Continue"}
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep2()) {
                        handleFinalSubmit(
                          setIsSubmitting,
                          interests,
                          userId,
                          otherInterest,
                          digitalRightsInfo,
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
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Floating Cubes Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
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

            {/* Referral Form Content */}
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={referralForm.fullName}
                    onChange={handleReferralFormChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={referralForm.email}
                    onChange={handleReferralFormChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* YouTube Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    YouTube Channels *
                  </label>
                  {referralForm.youtubeChannels.map((channel, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <div className="flex-1 relative">
                        <input
                          type="url"
                          name={`youtubeChannel${index}`}
                          value={channel}
                          onChange={handleReferralFormChange}
                          className="w-full px-3 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="https://youtube.com/@yourchannel"
                        />
                        {/* Verification icon */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {verifyingChannels[index] ? (
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : channelVerification[index] === true ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : channelVerification[index] === false ? (
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
                  ))}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
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