import type { ReactElement } from 'react';
import type { ActivityType } from '../types';
import { BookOpen, Users, UtensilsCrossed } from 'lucide-react';

const SportsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18" />
    <path d="M3 12h18" />
    <path d="M6.2 6.2c3.6 3.6 8 3.6 11.6 0" />
    <path d="M6.2 17.8c3.6-3.6 8-3.6 11.6 0" />
  </svg>
);

export const activityIcons: Record<ActivityType, ReactElement> = {
  Food: <UtensilsCrossed size={14} />,
  Study: <BookOpen size={14} />,
  Sports: <SportsIcon />,
  Social: <Users size={14} />,
  Other: <Users size={14} />,
};
