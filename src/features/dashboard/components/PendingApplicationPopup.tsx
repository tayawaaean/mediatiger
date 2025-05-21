import React from "react";

interface PendingApplicationPopupProps {
  isOpen: boolean;
}

const PendingApplicationPopup: React.FC<PendingApplicationPopupProps> = ({
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900">
      <div className="bg-slate-800 rounded-xl p-12 max-w-xl w-full text-center shadow-2xl border-2 border-indigo-500/20">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-white mb-6">
          Application Submitted
        </h3>
        <div className="mb-8">
          <div
            className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden shadow-lg"
            style={{
              backgroundSize: "200% 100%",
              animation: "gradient-wave 3s ease infinite",
            }}
          >
            Pending
          </div>
        </div>
        <p className="text-slate-300 text-lg mb-4">
          Your application is under review.
        </p>
        <p className="text-slate-400">
          You will be automatically redirected to your dashboard once your
          application is approved.
        </p>
      </div>
    </div>
  );
};

export default PendingApplicationPopup;
