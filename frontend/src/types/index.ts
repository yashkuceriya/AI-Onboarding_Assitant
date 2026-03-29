export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  preferred_contact?: string;
  onboarding_step: OnboardingStep;
  profile_data: Record<string, unknown>;
}

export type OnboardingStep = 'welcome' | 'assessment' | 'documents' | 'scheduling' | 'complete';

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  quick_replies?: string[];
  created_at: string;
}

export interface Conversation {
  id: number;
  status: 'active' | 'complete';
}

export interface Document {
  id: number;
  status: 'uploaded' | 'processing' | 'reviewed' | 'confirmed';
  extracted_data: Record<string, string>;
  confidence_scores: Record<string, number>;
  document_type?: string;
  overall_confidence?: number;
  flags?: string[];
}

export interface AvailableSlot {
  id: number;
  time: string;
  period: 'morning' | 'afternoon';
}

export interface AvailableSlots {
  [date: string]: AvailableSlot[];
}

export interface Appointment {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
}

export interface Affirmation {
  content: string;
  category: string;
}

export interface SupportResource {
  title: string;
  description: string;
  type: string;
  links: { name: string; url: string }[];
}

export interface OnboardingItemData {
  id: number;
  title: string;
  emoji: string;
  position: number;
}

export interface OnboardingStepData {
  id: number;
  title: string;
  color: string;
  position: number;
  status: 'not_started' | 'in_progress' | 'completed';
  items: OnboardingItemData[];
}

export interface ChecklistItemData {
  id: number;
  title: string;
  completed: boolean;
  completed_at: string | null;
}

export interface DashboardData {
  steps: OnboardingStepData[];
  checklist: ChecklistItemData[];
  progress: {
    steps_completed: number;
    steps_total: number;
    checklist_completed: number;
    checklist_total: number;
  };
}

// Financial Explainer
export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface FinancialCalculation {
  monthly_payment: number;
  total_cost: number;
  total_interest: number;
  schedule_preview: AmortizationEntry[];
}

export interface FinancialExplanation {
  calculation: FinancialCalculation;
  explanation: string;
}

export interface WhatIfScenario {
  label?: string;
  principal?: number;
  apr?: number;
  term_months?: number;
}

export interface WhatIfResult {
  base: {
    principal: number;
    apr: number;
    term_months: number;
    monthly_payment: number;
    total_cost: number;
    total_interest: number;
  };
  scenarios: Array<{
    label: string;
    params: { principal: number; apr: number; term_months: number };
    monthly_payment: number;
    total_cost: number;
    total_interest: number;
    savings_vs_base: number;
  }>;
}

// Vehicle Recommendations
export interface VehicleRecommendation {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mpg: number;
  safety_rating: number;
  type: string;
  color: string;
  mileage: number;
  features: string[];
  image_gradient: [string, string];
  image_url?: string;
  match_score: number;
  match_reasons: string[];
}

// Progress
export interface Milestone {
  step: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  time_estimate: number;
}

export interface ProgressData {
  current_step: string;
  percentage: number;
  time_remaining_minutes: number;
  achievements: Achievement[];
  milestones: Milestone[];
}

// Trade-In
export interface TradeInEstimate {
  estimated_value: number;
  range_low: number;
  range_high: number;
  factors: {
    base_msrp: number;
    age_years: number;
    depreciation_pct: number;
    condition: string;
    condition_adjustment: string;
    mileage: number;
    expected_mileage: number;
    mileage_penalty: number;
  };
}

// Achievements
export interface Achievement {
  id: number;
  achievement_type: string;
  title: string;
  description: string;
  unlocked_at: string;
}

// Vehicle Inventory
export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  body_type: string;
  color: string;
  exterior_color: string;
  mpg: number;
  safety_rating: number;
  description: string;
  vin: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  location: string;
  features: string[];
  image_gradient: [string, string];
  image_url?: string;
  available: boolean;
  favorited: boolean;
}

export interface VehicleMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  makes: string[];
  body_types: string[];
}

// Delivery Tracking
export interface DeliveryTimeline {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
  completed_at: string | null;
}

// Notifications
export interface Notification {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  icon: string;
  action_url: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

// Sell Your Car
export interface SellOfferBreakdown {
  base_value: number;
  age_years: number;
  age_factor: number;
  mileage: number;
  mileage_factor: number;
  condition: string;
  condition_factor: number;
  estimated_value: number;
}

export interface SellOfferTimeline {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface SellOffer {
  id: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  vin: string | null;
  color: string | null;
  trim: string | null;
  description: string | null;
  offer_amount: number;
  range_low: number;
  range_high: number;
  offer_breakdown: SellOfferBreakdown;
  status: string;
  pickup_date: string | null;
  pickup_address: string | null;
  pickup_time_slot: string | null;
  photo_count: number;
  created_at: string;
  timeline: SellOfferTimeline[];
}

export interface Delivery {
  id: number;
  status: string;
  tracking_number: string;
  estimated_delivery_date: string;
  actual_delivery_date: string | null;
  delivery_address: string;
  driver_name: string | null;
  driver_phone: string | null;
  notes: string | null;
  vehicle: Vehicle;
  timeline: DeliveryTimeline[];
}
