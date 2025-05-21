import { BarChart3, Eye, Music, Play, Wallet } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext"; // Update the path based on your project structure

// Create a custom hook that returns the navigation items with translations
const useNavigationItems = () => {
  const { translate } = useLanguage(); // Get the translate function from your context

  return [
    {
      name: translate("overview"),
      section: "overview",
      icon: <Eye className="h-5 w-5" />,
      stepNumber: 1,
    },
    {
      name: translate("analytics"),
      section: "analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: translate("channelManagement"),
      section: "channels",
      icon: <Play className="h-5 w-5" />,
    },
    {
      name: translate("music"),
      section: "music",
      icon: <Music className="h-5 w-5" />,
    },
    {
      name: translate("balance"),
      section: "balance",
      icon: <Wallet className="h-5 w-5" />,
    },
  ];
};

// For backward compatibility, export both the hook and an initial static array
// This allows existing code to import either the array or the hook
const navigationItems = [
  {
    name: "Overview",
    section: "overview",
    icon: <Eye className="h-5 w-5" />,
    stepNumber: 1,
  },
  {
    name: "Analytics",
    section: "analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "Channel Management",
    section: "channels",
    icon: <Play className="h-5 w-5" />,
  },
  {
    name: "Music",
    section: "music",
    icon: <Music className="h-5 w-5" />,
  },
  {
    name: "Balance",
    section: "balance",
    icon: <Wallet className="h-5 w-5" />,
  },
];

export { navigationItems, useNavigationItems };