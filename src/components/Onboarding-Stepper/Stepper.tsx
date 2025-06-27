import { X } from "lucide-react";
import React, { useState } from "react";

interface ChannelInfo {
  name: string;
  email: string;
  youtubeLinks: string[];
  referralCode: string;
}

interface StepperProps {
  channelInfo: ChannelInfo;
  handleChannelInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setChannelInfo: React.Dispatch<React.SetStateAction<ChannelInfo>>;
  addChannelField: () => void;
  removeChannelField: (index: number) => void;
}

const YouTubeChannelField = ({
  link,
  index,
  onChange,
  onRemove,
  showRemove = true,
}: {
  link: string;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  showRemove?: boolean;
}) => (
  <div className="flex items-center space-x-2 mb-2">
    <input
      type="text"
      name={`youtubeLink${index}`}
      value={link}
      onChange={onChange}
      placeholder="https://youtube.com/@yourchannel"
      className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
    {showRemove && (
      <button
        onClick={onRemove}
        type="button"
        className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    )}
  </div>
);

export const Stepper: React.FC<StepperProps> = ({
  channelInfo,
  handleChannelInfoChange,
  setChannelInfo,
  addChannelField,
  removeChannelField,
}) => {
  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelInfo(prev => ({
      ...prev,
      referralCode: e.target.value
    }));
  };

  return (
    <div className="p-6">
      {/* Form */}
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={channelInfo.name}
            onChange={handleChannelInfoChange}
            placeholder="Enter your full name"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Your Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={channelInfo.email}
            onChange={handleChannelInfoChange}
            placeholder="Enter your email address"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* YouTube Channels */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            YouTube Channels <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {channelInfo.youtubeLinks.map((link, index) => (
              <YouTubeChannelField
                key={index}
                link={link || ""}
                index={index}
                onChange={handleChannelInfoChange}
                onRemove={() => removeChannelField(index)}
                showRemove={index > 0}
              />
            ))}
            <button
              onClick={addChannelField}
              type="button"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center transition-colors"
            >
              <span className="text-lg mr-1">+</span>
              Add another channel
            </button>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-white mb-2">
            Referral Code (Optional)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            value={channelInfo.referralCode}
            onChange={handleReferralChange}
            placeholder="Who invited you?"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// Demo component with sample data
export default function App() {
  const [channelInfo, setChannelInfo] = useState<ChannelInfo>({
    name: "",
    email: "",
    youtubeLinks: [""],
    referralCode: ""
  });

  const handleChannelInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('youtubeLink')) {
      const index = parseInt(name.replace('youtubeLink', ''));
      setChannelInfo(prev => ({
        ...prev,
        youtubeLinks: prev.youtubeLinks.map((link, i) => i === index ? value : link)
      }));
    } else {
      setChannelInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addChannelField = () => {
    setChannelInfo(prev => ({
      ...prev,
      youtubeLinks: [...prev.youtubeLinks, ""]
    }));
  };

  const removeChannelField = (index: number) => {
    setChannelInfo(prev => ({
      ...prev,
      youtubeLinks: prev.youtubeLinks.filter((_, i) => i !== index)
    }));
  };

  return (
    <Stepper
      channelInfo={channelInfo}
      handleChannelInfoChange={handleChannelInfoChange}
      setChannelInfo={setChannelInfo}
      addChannelField={addChannelField}
      removeChannelField={removeChannelField}
    />
  );
}