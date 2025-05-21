import {
  Activity,
  Award,
  DollarSign,
  Eye,
  TrendingDown,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import React from "react";
import { formatRelativeTime } from "../utils/dateUtils";
import { useLanguage } from "../contexts/LanguageContext"; // Update path as needed

interface ActivityItem {
  id: string;
  type: "view" | "subscriber" | "revenue" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    trend?: "up" | "down";
    amount?: number;
  };
}

interface RecentActivityProps {
  recentActivity: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
                                                                recentActivity,
                                                              }) => {
  // Get language translation functions
  const { translate, currentLanguage } = useLanguage();

  // Custom formatRelativeTime function that uses the user's language
  const formatRelativeTimeWithLocale = (timestamp: string): string => {
    // You can modify the existing formatRelativeTime function to use currentLanguage.code
    // If you need to completely replace it, you can implement a custom version here
    return formatRelativeTime(timestamp, currentLanguage.code);
  };

  // Function to translate titles and descriptions
  const getTranslatedContent = (activity: ActivityItem) => {
    // For standard sample activities, we can provide translations
    // For real backend data, we'll use the original text

    // Map of known activity types to translation keys
    const titleMap: Record<string, string> = {
      "Viewership Spike": "activity.viewershipSpike",
      "New Subscriber Milestone": "activity.subscriberMilestone",
      "Revenue Update": "activity.revenueUpdate",
      "Achievement Unlocked": "activity.achievementUnlocked"
    };

    // Map of channel names to translation keys
    const channelNameMap: Record<string, string> = {
      "Gaming Adventures": "activity.channelNames.gamingAdventures"
    };

    // Extract channel name from the description if it exists
    let channelName = '';
    const channelMatch = activity.description.match(/"([^"]+)"/);
    if (channelMatch && channelMatch[1]) {
      channelName = channelMatch[1];

      // Translate the channel name if we have a mapping for it
      if (channelNameMap[channelName]) {
        channelName = translate(channelNameMap[channelName]);
      }
    }

    // Process specific sample activities
    let translatedTitle = activity.title;
    let translatedDescription = activity.description;

    // Try to translate the title if it's a known sample
    if (titleMap[activity.title]) {
      translatedTitle = translate(titleMap[activity.title]);
    }

    // Handle specific description patterns
    if (activity.type === "view" && activity.description.includes("saw a") && activity.description.includes("increase in views")) {
      // For viewership spike
      translatedDescription = translate("activity.viewershipDescription")
          .replace('{channel}', channelName ? `"${channelName}"` : '')
          .replace('{percent}', '25%');
    }
    else if (activity.type === "subscriber" && activity.description.includes("subscribers")) {
      // For subscriber milestone
      translatedDescription = translate("activity.subscriberDescription")
          .replace('{count}', '100K');
    }
    else if (activity.type === "revenue" && activity.description.includes("Monthly revenue")) {
      // For revenue update
      translatedDescription = translate("activity.revenueDescription")
          .replace('{percent}', '15%');
    }
    else if (activity.type === "milestone" && activity.description.includes("video reached")) {
      // For achievement
      translatedDescription = translate("activity.achievementDescription")
          .replace('{count}', '1M');
    }

    return { translatedTitle, translatedDescription };
  };

  return (
      <div className="col-span-full md:col-span-2 bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 text-indigo-400 mr-2" />
          {translate("activity.recentActivity")}
        </h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
          {recentActivity.map((activity) => {
            const { translatedTitle, translatedDescription } = getTranslatedContent(activity);

            return (
                <div
                    key={activity.id}
                    className="bg-slate-700/50 rounded-lg p-4 flex items-start space-x-4"
                >
                  <div
                      className={`p-2 rounded-full ${
                          activity.type === "view"
                              ? "bg-blue-500/20"
                              : activity.type === "subscriber"
                                  ? "bg-green-500/20"
                                  : activity.type === "revenue"
                                      ? "bg-purple-500/20"
                                      : "bg-indigo-500/20"
                      }`}
                  >
                    {activity.type === "view" && (
                        <Eye className="h-5 w-5 text-blue-400" />
                    )}
                    {activity.type === "subscriber" && (
                        <UsersIcon className="h-5 w-5 text-green-400" />
                    )}
                    {activity.type === "revenue" && (
                        <DollarSign className="h-5 w-5 text-purple-400" />
                    )}
                    {activity.type === "milestone" && (
                        <Award className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium">
                        {translatedTitle}
                      </h4>
                      <span className="text-sm text-slate-400">
                    {formatRelativeTimeWithLocale(activity.timestamp)}
                  </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      {translatedDescription}
                    </p>
                    {activity.metadata?.trend && (
                        <div
                            className={`flex items-center mt-2 ${
                                activity.metadata.trend === "up"
                                    ? "text-green-400"
                                    : "text-red-400"
                            }`}
                        >
                          {activity.metadata.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="text-sm">
                      {activity.metadata.amount}%{" "}
                            {activity.metadata.trend === "up"
                                ? translate("activity.increase")
                                : translate("activity.decrease")}
                    </span>
                        </div>
                    )}
                  </div>
                </div>
            );
          })}
        </div>
      </div>
  );
};

/* CSS to hide scrollbar but keep functionality */
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Add the styles to the document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}