// Typy pre systém tém notifikácií

export interface NotificationTopic {
  id: string;
  
  // Názvy v rôznych jazykoch
  name_sk: string;
  name_en?: string;
  name_cs?: string;
  
  slug: string;
  
  // Popisy
  description_sk?: string;
  description_en?: string;
  description_cs?: string;
  
  // Vizuálne vlastnosti
  icon?: string;
  color: string;
  
  // Nastavenia
  is_active: boolean;
  is_default: boolean;
  
  // Poradie a kategória
  display_order: number;
  category?: 'spiritual' | 'educational' | 'news' | 'other';
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface NotificationTopicWithStats extends NotificationTopic {
  subscriber_count: number;
  total_sent: number;
}

export interface UserNotificationPreference {
  id: string;
  user_id: string;
  topic_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationPreferenceWithTopic extends UserNotificationPreference {
  topic: NotificationTopic;
}

// Form data pre vytváranie/úpravu témy
export interface NotificationTopicFormData {
  name_sk: string;
  name_en?: string;
  name_cs?: string;
  slug: string;
  description_sk?: string;
  description_en?: string;
  description_cs?: string;
  icon?: string;
  color: string;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  category?: string;
}

// Pomocné typy pre API responses
export interface NotificationTopicsResponse {
  topics: NotificationTopicWithStats[];
  total: number;
}

export interface UserPreferencesResponse {
  preferences: UserNotificationPreferenceWithTopic[];
  available_topics: NotificationTopic[];
}

// Kategórie
export const TOPIC_CATEGORIES = {
  spiritual: 'Duchovné',
  educational: 'Vzdelávacie',
  news: 'Oznamy',
  other: 'Ostatné'
} as const;

export type TopicCategory = keyof typeof TOPIC_CATEGORIES;

// Predvolené ikony
export const AVAILABLE_ICONS = [
  'book-open',
  'bell',
  'heart',
  'hands-praying',
  'rosary',
  'calendar',
  'star',
  'church',
  'cross',
  'bible',
  'candle',
  'dove'
] as const;

// Predvolené farby
export const AVAILABLE_COLORS = [
  '#4A5085', // Primary blue
  '#F59E0B', // Amber
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
] as const;
