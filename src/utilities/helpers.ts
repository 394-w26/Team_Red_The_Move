import type { DocumentData } from 'firebase/firestore';
import type { Move } from '../types';

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const firestoreDocToMove = (docData: DocumentData, docId: string): Move => {
  const fallbackMaxParticipants = 12;
  const attendees = Array.isArray(docData.attendees) ? docData.attendees : [];
  const maxParticipants = Number(docData.maxParticipants);
  const normalizedMaxParticipants =
    Number.isFinite(maxParticipants) && maxParticipants >= 1
      ? maxParticipants
      : fallbackMaxParticipants;
  const safeMaxParticipants = Math.max(normalizedMaxParticipants, attendees.length);

  return {
    id: docId,
    title: docData.title ?? '',
    description: docData.description ?? '',
    remarks: typeof docData.remarks === 'string' ? docData.remarks : '',
    signupPrompt: typeof docData.signupPrompt === 'string' ? docData.signupPrompt : '',
    signupPromptRequiresResponse: Boolean(docData.signupPromptRequiresResponse),
    signupResponses: Array.isArray(docData.signupResponses) ? docData.signupResponses : [],
    location: docData.location ?? '',
    locationName: typeof docData.locationName === 'string' ? docData.locationName : undefined,
    locationUrl: typeof docData.locationUrl === 'string' ? docData.locationUrl : undefined,
    latitude: typeof docData.latitude === 'number' ? docData.latitude : undefined,
    longitude: typeof docData.longitude === 'number' ? docData.longitude : undefined,
    startTime: docData.startTime ?? new Date().toISOString(),
    endTime: docData.endTime ?? new Date().toISOString(),
    createdAt: docData.createdAt ?? new Date().toISOString(),
    area: (docData.area ?? 'Other'),
    activityType: (docData.activityType ?? 'Other'),
    hostId: docData.hostId ?? '',
    hostName: docData.hostName ?? '',
    attendees,
    waitlist: Array.isArray(docData.waitlist) ? docData.waitlist : [],
    maxParticipants: safeMaxParticipants,
    comments: Array.isArray(docData.comments) ? docData.comments : [],
  };
};

export const formatTimeAgo = (isoTime: string, now: number) => {
  const timestamp = new Date(isoTime).getTime();
  if (Number.isNaN(timestamp)) return 'just now';
  const diff = Math.max(0, now - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
};

export const formatEventTime = (isoTime: string) => {
  const timestamp = new Date(isoTime);
  if (Number.isNaN(timestamp.getTime())) return isoTime;
  return timestamp.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatEventDayDate = (isoTime: string) => {
  const timestamp = new Date(isoTime);
  if (Number.isNaN(timestamp.getTime())) return isoTime;
  return timestamp.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatEventTimeOnly = (isoTime: string) => {
  const timestamp = new Date(isoTime);
  if (Number.isNaN(timestamp.getTime())) return isoTime;
  return timestamp.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

/** Format event date range with relative day (Today/Tomorrow/weekday) for card display */
export const formatDateRangeWithRelative = (
  startIso: string,
  endIso: string,
  now: number
): string => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startIso}-${endIso}`;

  const dateStr = start.toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const startTime = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const endTime = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const todayStr = new Date(now).toDateString();
  const tomorrowStr = new Date(now + 24 * 60 * 60 * 1000).toDateString();
  const startDayStr = start.toDateString();
  const relative =
    startDayStr === todayStr
      ? 'Today'
      : startDayStr === tomorrowStr
        ? 'Tomorrow'
        : start.toLocaleDateString(undefined, { weekday: 'short' });

  return `${dateStr}, ${startTime}-${endTime} (${relative})`;
};

export const getStatusLabel = (startTime: string, endTime: string, now: number) => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 'Upcoming';
  if (now < start) return 'Upcoming';
  if (now <= end) return 'Live Now';
  return 'Past';
};

export const sortByNewest = (moves: Move[]) =>
  [...moves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Calculate distance between two coordinates using the Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 0.1) {
    return '< 0.1 mi';
  } else if (distance < 1) {
    return `${distance.toFixed(1)} mi`;
  } else {
    return `${distance.toFixed(1)} mi`;
  }
};
