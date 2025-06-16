export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  comingSoon?: boolean;
}

export interface FormData {
  name: string;
  email: string;
  message: string;
}

export interface FormErrors {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormSubmissionData {
  name: string;
  email: string;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export interface HeroProps {
  isPageLoaded: boolean;
}

export interface FeaturesProps {
  features: Feature[];
}

export interface ContactProps {
  onSubmit: (data: ContactFormSubmissionData) => Promise<void>;
}

export interface StatsData {
  countries: string;
  creators: string;
  contentItems: string;
  paidOut: string;
}

export interface LoadingState {
  isInitialLoading: boolean;
  isNavigationLoaded: boolean;
  isHeroLoaded: boolean;
  isContentLoaded: boolean;
  loadingProgress: number;
}