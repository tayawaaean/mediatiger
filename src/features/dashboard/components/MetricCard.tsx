import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  previousLabel: string;
  previousValue: string;
  change: number;
  changeColor: string;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousLabel,
  previousValue,
  changeColor,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-2xl p-3 shadow-lg overflow-hidden">
        <div className="space-y-2">
          <div className="h-4 w-24 mx-auto animate-shimmer rounded bg-slate-700"></div>
          <div className="h-8 w-32 mx-auto animate-shimmer rounded bg-slate-700"></div>
          <div className="h-4 w-28 mx-auto animate-shimmer rounded bg-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-3 shadow-lg transition-all duration-300 hover:shadow-xl fade-in">
      {title && (
        <h3 className="text-slate-400 text-xs text-center mb-1">{title}</h3>
      )}
      <p className="text-2xl font-bold text-center mb-1">{value}</p>
      <div className="flex justify-center items-center gap-1">
        <span className="text-slate-400 text-xs">{previousLabel}</span>
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={changeColor}>
            <path d="m5 12 7-7 7 7"></path>
            <path d="M12 19V5"></path>
          </svg>
          <span className={`${changeColor} text-xs`}>{previousValue}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
