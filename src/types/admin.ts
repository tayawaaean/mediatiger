export type ApplicationData = {
  id: string;
  name: string;
  email: string;
  interests: string[];
  other_interest: string | null;
  youtube_links: string[];
  website: string | null;
  youtube_channel: string | null;
  status: string;
  created_at: string;
  verification_code: string;
  handleApplicationStatus: any;
};