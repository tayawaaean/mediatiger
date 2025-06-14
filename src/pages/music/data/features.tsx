import React from 'react';
import { Play, Shield, DollarSign, GraduationCap } from 'lucide-react';
import { Feature } from '../types';

export const featuresData: Feature[] = [
  {
    icon: <Play className="h-8 w-8 text-indigo-500" />,
    title: "Channel Management",
    description: "Streamline your content distribution across multiple channels with our advanced management system.",
    path: "/features/channel-management",
  },
  {
    icon: <Shield className="h-8 w-8 text-indigo-500" />,
    title: "Digital Rights",
    description: "Protect your intellectual property with our comprehensive digital rights management solution.",
    path: "/features/digital-rights",
  },
  {
    icon: <DollarSign className="h-8 w-8 text-indigo-500" />,
    title: "Boutique Monetization",
    description: "Maximize your revenue potential with personalized, innovative monetization strategies tailored to your content.",
    path: "/features/boutique-monetization",
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-indigo-500" />,
    title: "Creator School",
    description: "Are you a beginner that wants to start creating and making money but don't know where to start? MediaTiger can help guide you from start to finish.",
    path: "/features/channel-management",
    comingSoon: true,
  },
];