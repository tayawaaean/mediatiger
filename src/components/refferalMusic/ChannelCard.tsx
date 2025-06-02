import React from 'react';
import { CheckCircle, MonitorPlay } from 'lucide-react';

interface ChannelCardProps {
    link: string;
    revenue: number;

}

const ChannelCard = ({ link,revenue  }: ChannelCardProps) => { 
    return (
    <div 
      className={`flex items-center p-4 rounded-lg transition-colors border border-[#2A325A] w-64`}
    >
      <div className="flex items-center justify-center bg-[#141A31] h-10 w-10 rounded-md mr-3">
        <MonitorPlay size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-white font-medium">{link.replace("https://www.youtube.com/", "")}</span> 
            <CheckCircle size={16} className="ml-1 text-blue-400 fill-blue-400" /> 
        </div>
              <p className="text-sm"><span className="text-green-500">${revenue}</span><span className="text-gray-400"> this month</span></p>
      </div>
    </div>
  );
};

export default ChannelCard;