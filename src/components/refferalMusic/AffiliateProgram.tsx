import {
  Copy,
  Share2,
  CheckCircle,
  ToggleRight,
  ToggleLeft,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "../ui/switch";
import { supabase } from "../../lib/supabase";
import ChannelCard from "./ChannelCard";

export const AffiliateProgram = () => {
  const [copied, setCopied] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");
  const [affiliateChannels, setAffiliateChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAffiliateInfo, setShowAffiliateInfo] = useState(false);
  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      setAffiliateCode(user?.user_metadata?.username);

      const { data: affiliateData, error: affiliateError } = await supabase
        .from("referrals")
        .select("user_id")
        .eq("referral_id", user.id);

      if (affiliateError) throw affiliateError;

      console.log(affiliateData);
      let { data: channelData, error: channelError } = await supabase
        .from("user_requests")
        .select("youtube_links")
        .in(
          "user_id",
          affiliateData.map((item) => item.user_id)
        );

      if (channelError) throw channelError;
      const flattenedLinks = channelData?.flatMap((y) => y.youtube_links) || [];
      const uniqueLinks = [...new Set(flattenedLinks)];
      setAffiliateChannels(uniqueLinks);
      if (uniqueLinks.length === 0) setShowAffiliateInfo(true);
      console.log("set", uniqueLinks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(affiliateCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-slate-800 rounded-xl p-6 mx-auto">
      <div className="flex items-center mb-4">
        <h2 className="text-white text-lg font-medium mr-3">
          Affiliate Program
        </h2>
        <>
          <button
            onClick={() => setShowAffiliateInfo(!showAffiliateInfo)}
            className="flex items-center mr-3"
          >
            {!showAffiliateInfo ? (
              <ToggleRight size={24} className="text-purple-500" />
            ) : (
              <ToggleLeft size={24} className="text-gray-500" />
            )}
          </button>
          <div className="flex items-center">
            <ArrowLeft size={18} className="text-purple-500 mr-1" />
            <span className="text-purple-500 font-medium">
              {!showAffiliateInfo ? "View Program Info" : "Back to Channels"}
            </span>
          </div>
        </>
      </div>

      {showAffiliateInfo ? (
        <>
          <div className="prose prose-invert text-slate-300 mb-6">
            <p>
              We would appreciate it if you can share this out to EVERY agencies
              and creators you know, as we know this can help them greatly and
              we looking to expand our reach and connections.
            </p>

            <p className="my-4">
              For your efforts, you will earn an extra 5% of monthly recurring
              revenue (Not the creator's portion, but MediaTiger's) for every
              correlating agencies and channels you bring in, for LIFE.
            </p>

            <p>
              We want to help as many creators as they can be earning so much
              more and to reward them for their great work on shorts. We truly
              do believe that our services can benefit EVERY single creator on
              YouTube.
            </p>
          </div>
          <div className="mb-8">
            <div className="mt-6 bg-[#232A4D] rounded-lg p-4 border border-purple-500/20">
              <p className="text-gray-300 mb-2">Your Affiliate Code:</p>
              <p className="text-2xl font-semibold text-purple-400">
                {affiliateCode}
              </p>
            </div>
          </div>
        </>
      ) : affiliateChannels?.length != 0 ? (
        <div>
          {affiliateChannels?.map((c) => (
            <ChannelCard link={c} revenue={0} />
          ))}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};
