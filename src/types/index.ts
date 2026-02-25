// =============================================================================
// PLATFORM-WIDE TYPESCRIPT TYPES
// Strict typing for all entities
// =============================================================================

// --- Enums -------------------------------------------------------------------

export type UserRole = 'owner' | 'admin' | 'agent';
export type PropertyStatus = 'available' | 'reserved' | 'sold';
export type PropertyType =
  | 'house' | 'apartment' | 'office' | 'land'
  | 'commercial' | 'warehouse' | 'parking' | 'other';
export type CurrencyType = 'USD' | 'EUR' | 'ARS' | 'COP' | 'MXN' | 'CLP' | 'PEN' | 'BRL';
export type MediaType = 'image' | 'video';
export type VideoType = 'reel' | 'tour' | 'general';
export type PublicationPlatform =
  | 'instagram_feed' | 'instagram_reel'
  | 'facebook_feed' | 'facebook_reel';
export type PublicationStatus =
  | 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'PUBLISHED' | 'ERROR' | 'CANCELLED';
export type AuditAction =
  | 'create' | 'update' | 'delete' | 'publish' | 'login' | 'invite' | 'role_change';

// --- Database Row Types ------------------------------------------------------

export interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  website_domain: string | null;
  whatsapp_number: string | null;
  instagram_handle: string | null;
  facebook_page_name: string | null;
  is_active: boolean;
  plan: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  agency_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  agency_id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: CurrencyType;
  property_type: PropertyType;
  status: PropertyStatus;
  country: string;
  state: string;
  city: string;
  area: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  built_area_m2: number | null;
  land_area_m2: number | null;
  floors: number;
  features: string[];
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  agency_id: string;
  media_type: MediaType;
  video_type: VideoType | null;
  url: string;
  storage_path: string;
  thumbnail_url: string | null;
  watermarked_url: string | null;
  is_cover: boolean;
  sort_order: number;
  width: number | null;
  height: number | null;
  duration_sec: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Client {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  notes: string | null;
  source: string | null;
  assigned_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPreferences {
  id: string;
  client_id: string;
  agency_id: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: CurrencyType;
  property_types: PropertyType[];
  preferred_cities: string[];
  preferred_areas: string[];
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  min_bathrooms: number | null;
  min_area_m2: number | null;
  required_features: string[];
  notes: string | null;
  updated_at: string;
}

export interface MetaConnection {
  id: string;
  agency_id: string;
  // Tokens are never exposed to client - kept server-side
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  instagram_account_id: string | null;
  instagram_username: string | null;
  token_expires_at: string | null;
  scopes: string[];
  is_active: boolean;
  connected_by: string | null;
  connected_at: string | null;
  last_refresh: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicationJob {
  id: string;
  agency_id: string;
  property_id: string;
  platform: PublicationPlatform;
  caption: string;
  media_urls: string[];
  scheduled_at: string | null;
  published_at: string | null;
  status: PublicationStatus;
  retries: number;
  max_retries: number;
  next_retry_at: string | null;
  meta_post_id: string | null;
  meta_media_id: string | null;
  error_log: string | null;
  error_code: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  property?: Property;
  creator?: Pick<User, 'first_name' | 'last_name' | 'email'>;
}

export interface AuditLog {
  id: string;
  agency_id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: Pick<User, 'first_name' | 'last_name' | 'email'>;
}

// --- API / Form Types --------------------------------------------------------

export interface CreatePropertyInput {
  code: string;
  title: string;
  description: string;
  price: number;
  currency: CurrencyType;
  property_type: PropertyType;
  status: PropertyStatus;
  state: string;
  city: string;
  area?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  built_area_m2?: number;
  land_area_m2?: number;
  floors?: number;
  features: string[];
  tags: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  status?: PropertyStatus;
}

export interface PropertySearchParams {
  query?: string;
  property_type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  currency?: CurrencyType;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_area_m2?: number;
  features?: string[];
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
  page?: number;
  per_page?: number;
  agency_slug?: string; // for public website routing
}

export interface CreatePublicationJobInput {
  property_id: string;
  platform: PublicationPlatform;
  caption: string;
  media_urls: string[];
  scheduled_at?: string;
}

export interface CreateClientInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  notes?: string;
  source?: string;
  assigned_to?: string;
  preferences?: Omit<ClientPreferences, 'id' | 'client_id' | 'agency_id' | 'updated_at'>;
}

// --- Dashboard Types ---------------------------------------------------------

export interface DashboardStats {
  total_properties: number;
  available_count: number;
  reserved_count: number;
  sold_count: number;
  pending_jobs: number;
  failed_jobs: number;
  published_this_month: number;
  total_clients: number;
}

export interface PublicationByPlatform {
  platform: PublicationPlatform;
  total: number;
  success: number;
  failed: number;
}

// --- Client Matching ---------------------------------------------------------

export interface PropertyMatch {
  property: Property;
  score: number; // 0-100
  match_reasons: string[];
  media: PropertyMedia[];
}

// --- Meta API Types ----------------------------------------------------------

export interface MetaPageInfo {
  id: string;
  name: string;
  access_token: string;
}

export interface MetaInstagramAccount {
  id: string;
  username: string;
  name: string;
}

export interface MetaPublishResult {
  success: boolean;
  post_id?: string;
  media_id?: string;
  error?: string;
  error_code?: string;
}

// --- Supabase DB type shorthand ----------------------------------------------

export interface Database {
  public: {
    Tables: {
      agencies: { Row: Agency; Insert: Partial<Agency>; Update: Partial<Agency>; Relationships: [] };
      users: { Row: User; Insert: Partial<User>; Update: Partial<User>; Relationships: [] };
      properties: { Row: Property; Insert: CreatePropertyInput; Update: UpdatePropertyInput; Relationships: [] };
      property_media: { Row: PropertyMedia; Insert: Partial<PropertyMedia>; Update: Partial<PropertyMedia>; Relationships: [] };
      clients: { Row: Client; Insert: CreateClientInput; Update: Partial<Client>; Relationships: [] };
      client_preferences: { Row: ClientPreferences; Insert: Partial<ClientPreferences>; Update: Partial<ClientPreferences>; Relationships: [] };
      meta_connections: { Row: MetaConnection; Insert: Partial<MetaConnection>; Update: Partial<MetaConnection>; Relationships: [] };
      publication_jobs: { Row: PublicationJob; Insert: CreatePublicationJobInput; Update: Partial<PublicationJob>; Relationships: [] };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

