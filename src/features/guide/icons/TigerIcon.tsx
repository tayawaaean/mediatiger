import React from 'react';

interface TigerIconProps {
  className?: string;
  small?: boolean;
}

const TigerIcon: React.FC<TigerIconProps> = ({ className = '', small = false }) => {
  // If small is true, render a simpler version for the sidebar and content header
  if (small) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="50" cy="50" r="45" fill="#E5A93C" />
        <circle cx="50" cy="50" r="35" fill="white" />
        <path
          d="M25 35 L35 25 L45 35 L55 25 L65 35 L75 25"
          stroke="#E5A93C"
          strokeWidth="4"
          fill="none"
        />
        <circle cx="40" cy="45" r="4" fill="#333" />
        <circle cx="60" cy="45" r="4" fill="#333" />
        <circle cx="50" cy="55" r="5" fill="#333" />
        <path
          d="M42 65 Q50 70 58 65"
          stroke="#333"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    );
  }

  // For the main header, render the full tiger with sign
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tiger Body */}
      <circle cx="100" cy="90" r="50" fill="#E5A93C" />
      <circle cx="100" cy="90" r="40" fill="white" />
      
      {/* Tiger Ears */}
      <path d="M60 60 L75 40 L90 60" fill="#E5A93C" />
      <path d="M110 60 L125 40 L140 60" fill="#E5A93C" />
      
      {/* Tiger Stripes */}
      <path
        d="M70 65 L80 55 L90 65 L100 55 L110 65 L120 65 L130 55"
        stroke="#E5A93C"
        strokeWidth="4"
        fill="none"
      />
      
      {/* Eyes */}
      <circle cx="85" cy="80" r="5" fill="#333" />
      <circle cx="115" cy="80" r="5" fill="#333" />
      
      {/* Nose */}
      <circle cx="100" cy="90" r="6" fill="#333" />
      
      {/* Mouth */}
      <path
        d="M90 100 Q100 110 110 100"
        stroke="#333"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Sign */}
      <rect x="70" y="110" width="60" height="30" rx="5" fill="white" stroke="#333" strokeWidth="2" />
      <text x="100" y="130" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">TUTORIAL</text>
      
      {/* Arm */}
      <path
        d="M130 120 Q140 115 145 130"
        stroke="#E5A93C"
        strokeWidth="8"
        fill="#E5A93C"
      />
      
      {/* Tail */}
      <path
        d="M140 90 Q160 85 165 100 Q170 110 160 120"
        stroke="#E5A93C"
        strokeWidth="6"
        fill="none"
      />
    </svg>
  );
};

export default TigerIcon;