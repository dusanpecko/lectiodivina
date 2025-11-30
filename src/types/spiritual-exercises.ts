// Types for Spiritual Exercises (Duchovné cvičenia)

export interface SpiritualExercise {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  full_description: string | null;
  image_url: string | null;
  home_image_url: string | null;
  
  start_date: string; // ISO timestamp
  end_date: string; // ISO timestamp
  
  location_name: string;
  location_address: string | null;
  location_city: string | null;
  location_country: string;
  
  locale_id: number;
  locale?: Locale; // Joined data
  
  leader_name: string | null;
  leader_bio: string | null;
  leader_photo: string | null;
  
  max_capacity: number | null;
  current_registrations: number;
  
  is_published: boolean;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  // Related data (when joined)
  pricing?: SpiritualExercisePricing[];
  testimonials?: SpiritualExerciseTestimonial[];
  forms?: SpiritualExerciseForm[];
  gallery?: SpiritualExerciseGallery[];
}

export interface SpiritualExercisePricing {
  id: number;
  exercise_id: number;
  room_type: string;
  price: number;
  deposit: number; // Deposit/handling fee for this room type
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface SpiritualExerciseTestimonial {
  id: number;
  exercise_id: number;
  author_name: string;
  testimonial_text: string;
  rating: number | null; // 1-5 stars
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface SpiritualExerciseForm {
  id: number;
  exercise_id: number;
  form_id: string; // EasyForms ID
  is_active: boolean;
  created_at: string;
}

export interface SpiritualExerciseGallery {
  id: number;
  exercise_id: number;
  image_url: string;
  caption: string | null;
  alt_text: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface Locale {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form types for creating/updating
export interface CreateSpiritualExerciseInput {
  title: string;
  slug?: string;
  description?: string;
  full_description?: string;
  image_url?: string;
  
  start_date: string;
  end_date: string;
  
  location_name: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  
  locale_id: number;
  
  leader_name?: string;
  leader_bio?: string;
  leader_photo?: string;
  
  max_capacity?: number;
  
  is_published?: boolean;
  is_active?: boolean;
}

export interface UpdateSpiritualExerciseInput extends Partial<CreateSpiritualExerciseInput> {
  id: number;
}

export interface CreatePricingInput {
  exercise_id: number;
  room_type: string;
  price: number;
  description?: string;
  display_order?: number;
}

export interface UpdatePricingInput extends Partial<CreatePricingInput> {
  id: number;
}

export interface CreateTestimonialInput {
  exercise_id: number;
  author_name: string;
  testimonial_text: string;
  rating?: number;
  display_order?: number;
  is_visible?: boolean;
}

export interface UpdateTestimonialInput extends Partial<CreateTestimonialInput> {
  id: number;
}

export interface CreateGalleryInput {
  exercise_id: number;
  image_url: string;
  caption?: string;
  alt_text?: string;
  display_order?: number;
  is_visible?: boolean;
}

export interface UpdateGalleryInput extends Partial<CreateGalleryInput> {
  id: number;
}

export interface CreateFormInput {
  exercise_id: number;
  form_id: string;
  is_active?: boolean;
}

export interface UpdateFormInput extends Partial<CreateFormInput> {
  id: number;
}

// API response types
export interface SpiritualExercisesListResponse {
  exercises: SpiritualExercise[];
  total: number;
  page?: number;
  limit?: number;
}

export interface SpiritualExerciseDetailResponse extends SpiritualExercise {
  pricing: SpiritualExercisePricing[];
  testimonials: SpiritualExerciseTestimonial[];
  forms: SpiritualExerciseForm[];
  gallery: SpiritualExerciseGallery[];
  locale: Locale;
}

// Registration types
export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled';
export type RegistrationSource = 'web' | 'admin' | 'app';

export interface SpiritualExerciseRegistration {
  id: number;
  exercise_id: number;
  
  // Contact Information
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Personal Information
  birth_date: string; // ISO date
  id_card_number: string;
  
  // Address
  city: string;
  street: string;
  postal_code: string;
  
  // Church Information
  parish: string | null;
  diocese: string | null;
  
  // Accommodation
  room_type: string;
  dietary_restrictions: string | null;
  
  // Additional Information
  notes: string | null;
  referral_source: string | null;
  
  // GDPR Consents
  gdpr_consent: boolean;
  responsibility_consent: boolean;
  newsletter_consent: boolean;
  
  // Payment Status
  payment_status: PaymentStatus;
  payment_amount: number | null;
  payment_notes: string | null;
  
  // Metadata
  registration_date: string;
  updated_at: string;
  registered_by: RegistrationSource;
  
  // Joined data (when needed)
  exercise?: SpiritualExercise;
}

export interface CreateRegistrationInput {
  exercise_id: number;
  
  // Contact Information
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Personal Information
  birth_date: string;
  id_card_number: string;
  
  // Address
  city: string;
  street: string;
  postal_code: string;
  
  // Church Information
  parish?: string;
  diocese?: string;
  
  // Accommodation
  room_type: string;
  dietary_restrictions?: string;
  
  // Additional Information
  notes?: string;
  referral_source?: string;
  
  // GDPR Consents
  gdpr_consent: boolean;
  responsibility_consent: boolean;
  newsletter_consent?: boolean;
}

export interface UpdateRegistrationInput {
  payment_status?: PaymentStatus;
  payment_amount?: number;
  payment_notes?: string;
}

export interface RegistrationEmailData {
  registration: SpiritualExerciseRegistration;
  exercise: SpiritualExercise;
  pricing: SpiritualExercisePricing[];
  selectedRoomPrice: SpiritualExercisePricing;
}
