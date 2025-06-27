import React, { useState } from "react";
import { FileSpreadsheet, RefreshCw, UserCheck, UserX } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext"; // Import the useLanguage hook
import FadeInUp from "../../../components/FadeInUp";

interface YouTubeChannelsTabProps {
  applicationFilter: string;
  setApplicationFilter: (filter: string) => void;
  loadApplications: () => void;
  isLoadingApplications: boolean;
  channelsRequests: any[] | null;
  handleApplicationStatus: (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => void;
  handleReject: (id: string, reason: string) => void;
  showRejectionModalChannel: boolean;
  setShowRejectionModalChannel: (show: boolean) => void;
}

export const YouTubeChannelsTab: React.FC<YouTubeChannelsTabProps> = ({
  applicationFilter,
  setApplicationFilter,
  loadApplications,
  isLoadingApplications,
  channelsRequests,
  handleApplicationStatus,
  handleReject,
  showRejectionModalChannel,
  setShowRejectionModalChannel,
}) => {
  const { translate } = useLanguage(); // Hook for translation
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );

  return (
    <div>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-3 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400 mr-2" />
            {translate("youtubeChannels.channelsRequests")}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors hover:border-indigo-500/50"
            >
              <option value="pending">
                {translate("youtubeChannels.pending")}
              </option>
              <option value="approved">
                {translate("youtubeChannels.approved")}
              </option>
              <option value="rejected">
                {translate("youtubeChannels.rejected")}
              </option>
            </select>
            <button
              onClick={loadApplications}
              disabled={isLoadingApplications}
              className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  isLoadingApplications ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {isLoadingApplications ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-slate-300">
              {translate("youtubeChannels.loadingApplications")}
            </p>
          </div>
        ) : !channelsRequests || channelsRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>
              {translate("youtubeChannels.noApplicationsFound", {
                status: translate(`youtubeChannels.${applicationFilter}`),
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {channelsRequests?.map((app, idx) => (
              <FadeInUp key={app.id} delay={idx * 80}>
                <ChannelCard
                  app={app}
                  handleApplicationStatus={handleApplicationStatus}
                  handleReject={() => {
                    setSelectedChannelId(app.id);
                    setRejectionReason("");
                    setShowRejectionModalChannel(true);
                  }}
                />
              </FadeInUp>
            ))}
          </div>
        )}

        {showRejectionModalChannel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                {translate("youtubeChannels.provideRejectionReason")}
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
                placeholder={translate(
                  "youtubeChannels.enterReasonForRejection"
                )}
              />
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowRejectionModalChannel(false);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors order-2 sm:order-1"
                >
                  {translate("common.cancel")}
                </button>
                <button
                  onClick={() =>
                    handleReject(selectedChannelId, rejectionReason)
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
                >
                  {translate("youtubeChannels.rejectChannel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChannelCardProps {
  app: any;
  handleApplicationStatus: (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => void;
  handleReject: (id: string) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  app,
  handleApplicationStatus,
  handleReject,
}) => {
  const { translate } = useLanguage(); // Hook for translation

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
        <div className="w-full sm:w-auto">
          <h3 className="text-lg font-medium text-white break-words">
            {app.channel_name ||
              (app.link &&
                app.link.replace(
                  /^(https?:\/\/)?(www\.)?(youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/@)?/,
                  ""
                ))}
          </h3>
          <p className="text-slate-400 break-all">{app.email}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {app.status === "pending" && (
            <>
              <button
                onClick={() =>
                  handleApplicationStatus(
                    app.id,
                    "approved",
                    translate("youtubeChannels.approved")
                  )
                }
                className="px-4 py-2 bg-green-600/90 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-lg shadow-green-500/10 hover:shadow-green-500/20 w-full sm:w-auto justify-center sm:justify-start"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                {translate("youtubeChannels.approve")}
              </button>
              <button
                className="px-4 py-2 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-lg shadow-red-500/10 hover:shadow-red-500/20 w-full sm:w-auto justify-center sm:justify-start"
                onClick={() => handleReject(app.id)}
              >
                <UserX className="h-4 w-4 mr-1" />
                {translate("youtubeChannels.reject")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">
            {translate("youtubeChannels.interests")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {app.interests?.sort().map((interest: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700 rounded-md text-xs text-slate-300"
              >
                {interest}
              </span>
            ))}
          </div>
          {app.other_interest && (
            <p className="mt-2 text-sm text-slate-300">
              {translate("common.other")}: {app.other_interest}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">
            {translate("youtubeChannels.channelsLabel")}
          </h4>
          <div className="space-y-2">
            {app.youtube_links?.map(
              (link: string, index: number) =>
                link && (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group-hover:bg-slate-700 transition-colors"
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300 truncate max-w-full"
                    >
                      {link}
                    </a>
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>
          {translate("youtubeChannels.submitted")}:{" "}
          {new Date(app.created_at).toLocaleString()}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            app.status === "pending"
              ? "bg-yellow-500/20 text-yellow-300"
              : app.status === "approved"
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {translate(`youtubeChannels.${app.status}`)}
        </span>
      </div>
    </div>
  );
};
