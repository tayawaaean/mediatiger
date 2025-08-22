import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle, Copy, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext"; // Import language context
import { validateChannelSubmission, getChannelValidationErrorMessage } from "../../../utils/channelValidation";

interface NewChannelPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  loadChannels: () => void;
  type?: "channel" | "main";
}

export default function NewChannelPopup({
                                          isOpen,
                                          onClose,
                                          userId,
                                          type = "channel",
                                          userEmail,
                                          loadChannels,
                                        }: NewChannelPopupProps) {
  const { translate } = useLanguage(); // Use the language context
  const [channelInfo, setChannelInfo] = useState({
    youtubeLinks: [""],
    verificationCode: "",
    verifiedChannels: {} as Record<string, boolean>,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCopied, setVerificationCopied] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setChannelInfo((prev) => ({ ...prev, verificationCode: code }));
  }, []);

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(channelInfo.verificationCode);
    setVerificationCopied(true);
    setTimeout(() => setVerificationCopied(false), 2000);
  };

  const verifyChannel = async (channelUrl: string) => {
    if (!channelUrl.trim()) return;
    setIsVerifying(true);
    try {
      // Validate channel submission using utility function
      const validationResult = await validateChannelSubmission(
        channelUrl,
        userId,
        type
      );

      if (!validationResult.isValid) {
        const errorMessage = getChannelValidationErrorMessage(validationResult.error!, translate);
        toast.error(errorMessage);
        
        // Set verification status to false for invalid channels
        if (validationResult.error === 'ALREADY_REGISTERED_BY_OTHER_USER') {
          setChannelInfo((prev) => ({
            ...prev,
            verifiedChannels: { ...prev.verifiedChannels, [channelUrl]: false },
          }));
        }
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      const isVerified = true; // Simulated verification

      setChannelInfo((prev) => ({
        ...prev,
        verifiedChannels: {
          ...prev.verifiedChannels,
          [channelUrl]: isVerified,
        },
      }));

      if (isVerified) {
        const channelName = validationResult.channelMetadata?.name || 'Channel';
        if (validationResult.channelMetadata) {
          toast.success(`${translate("channel.verificationSuccess")}: ${channelName}`);
        } else {
          toast.success(`${translate("channel.verificationSuccess")} (API data unavailable)`);
        }
      } else {
        toast.error(translate("channel.verificationFailed"));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error verifying channel:", error.message);
        toast.error(error.message || translate("channel.verificationError"));
      } else {
        console.error("Unknown error verifying channel:", error);
        toast.error(translate("channel.verificationError"));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChannelInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("youtubeLink")) {
      const index = parseInt(name.replace("youtubeLink", ""));
      setChannelInfo((prev) => ({
        ...prev,
        youtubeLinks: prev.youtubeLinks.map((link, i) =>
            i === index ? value : link
        ),
      }));
    }
  };

  const removeChannelField = (index: number) => {
    setChannelInfo((prev) => ({
      ...prev,
      youtubeLinks: prev.youtubeLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validate channel submission using utility function
    const validationResult = await validateChannelSubmission(
      channelInfo.youtubeLinks[0],
      userId,
      type
    );

    if (!validationResult.isValid) {
      const errorMessage = getChannelValidationErrorMessage(validationResult.error!, translate);
      toast.error(errorMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      // get main request id
      const { data: dataReqId } = await supabase
          .from("user_requests")
          .select("id")
          .eq("user_id", userId)
          .single();
      if (type === "channel") {
        const { error } = await supabase.from("channels").insert([
          {
            user_id: userId,
            link: channelInfo.youtubeLinks[0],
            channel_name: validationResult.channelMetadata?.name || null,
            thumbnail: validationResult.channelMetadata?.thumbnail || null,
            status: "pending",
            main_request_id: dataReqId?.id,
          },
        ]);

        if (error) throw error;
      } else {
        // check if array is empty of youtube likns
        const { data: existingRequest } = await supabase
            .from("user_requests")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "approved")
            .single();
        if (
            channelInfo.youtubeLinks.filter((link) => link.trim() !== "")
                .length === 0
        ) {
          toast.error(translate("channel.addAtLeastOne"));
          return;
        }
        if (existingRequest?.youtube_links?.length === 0) {
          await supabase
              .from("user_requests")
              .update({
                youtube_links: channelInfo.youtubeLinks.filter(
                    (link) => link.trim() !== ""
                ),
              })
              .eq("user_id", userId);
        } else {
          const { error } = await supabase.from("user_requests").insert([
            {
              user_id: userId,
              interests: ["channelManagement"],
              name: user?.user_metadata?.full_name || "",
              email: userEmail,
              youtube_links: channelInfo.youtubeLinks.filter(
                  (link) => link.trim() !== ""
              ),
              status: "pending",
            },
          ]);
          if (error) {
            console.error("Error submitting request:", error);
            throw new Error(error.message);
          }
        }
      }
      toast.success(translate("channel.addedSuccessfully"));
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || translate("channel.addError"));
      } else {
        console.error("[AddNewChannel] Error:", error);
        toast.error(translate("channel.unknownError"));
      }
    } finally {
      setIsSubmitting(false);
      loadChannels();
    }
  };

  if (!isOpen) return null;

  return (
      <AnimatePresence mode="wait">
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full flex flex-col border border-slate-700"
          >
            <div className="bg-slate-700 px-6 py-4 flex items-center justify-center border-b border-slate-600">
              <h2 className="text-xl font-bold text-white">{translate("channel.addNewChannel")}</h2>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              <div className="space-y-3 mb-6">
                {channelInfo.youtubeLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                          type="text"
                          name={`youtubeLink${index}`}
                          value={link}
                          onChange={handleChannelInfoChange}
                          placeholder={translate("channel.enterChannelUrl")}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {index > 0 && (
                          <button
                              onClick={() => removeChannelField(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded"
                              aria-label={translate("common.remove")}
                          >
                            <X className="h-5 w-5" />
                          </button>
                      )}
                    </div>
                ))}

                {/* Commented verification section */}
                {/*
              <div className="mt-4 bg-slate-800/70 rounded-lg p-4 border border-slate-600">
                <h3 className="text-sm font-medium text-slate-300 mb-2">
                  {translate("channel.verification")}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {translate("channel.verificationInstructions")}
                </p>

                <div className="flex items-center space-x-2 bg-slate-700/70 p-2 rounded-md">
                  <code className="text-indigo-400 flex-1 font-mono">
                    {channelInfo.verificationCode}
                  </code>
                  <button
                    onClick={handleCopyVerification}
                    className="p-1 hover:bg-slate-600 rounded"
                    aria-label={translate("common.copy")}
                  >
                    {verificationCopied ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Copy className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {channelInfo.youtubeLinks.map(
                    (link, index) =>
                      link.trim() && (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-700/50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            {channelInfo.verifiedChannels[link] === false ? (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/20 text-red-400">
                                <X className="h-4 w-4" />
                              </div>
                            ) : channelInfo.verifiedChannels[link] === true ? (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                                <Check className="h-4 w-4" />
                              </div>
                            ) : null}
                            <span className="text-sm text-slate-300 truncate max-w-[200px]">
                              {link}
                            </span>
                          </div>
                          <button
                            onClick={() => verifyChannel(link)}
                            disabled={isVerifying}
                            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isVerifying ? translate("channel.checking") : translate("channel.verify")}
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>
              */}
              </div>
            </div>

            <div className="bg-slate-700 px-6 py-4 flex justify-end gap-3 border-t border-slate-600">
              <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500"
              >
                {translate("common.cancel")}
              </button>
              <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? translate("channel.adding") : translate("channel.addChannel")}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
  );
}