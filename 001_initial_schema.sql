-- =============================================================================
-- REAL ESTATE SAAS PLATFORM - Complete Database Schema
-- Multi-tenant architecture with RLS isolation per agency
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'agent');
CREATE TYPE property_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE property_type AS ENUM (
  'house', 'apartment', 'office', 'land', 'commercial', 'warehouse', 'parking', 'other'
);
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'ARS', 'COP', 'MXN', 'CLP', 'PEN', 'BRL');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE video_type AS ENUM ('reel', 'tour', 'general');
CREATE TYPE publication_platform AS ENUM (
  'instagram_feed', 'instagram_reel', 'facebook_feed', 'facebook_reel'
);
CREATE TYPE publication_status AS ENUM (
  'PENDING', 'UPLOADING', 'PROCESSING', 'PUBLISHED', 'ERROR', 'CANCELLED'
);
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'publish', 'login', 'invite', 'role_change'
);

-- =============================================================================
-- AGENCIES (Tenants)
-- =============================================================================

CREATE TABLE agencies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE, -- used for subdomain routing
  email         TEXT NOT NULL,
  phone         TEXT,
  address       TEXT,
  logo_url      TEXT,
  primary_color VARCHAR(7) DEFAULT '#1a1a2e',
  secondary_color VARCHAR(7) DEFAULT '#e94560',
  website_domain TEXT UNIQUE, -- custom domain if provided
  whatsapp_number TEXT,
  instagram_handle TEXT,
  facebook_page_name TEXT,
  is_active     BOOLEAN DEFAULT true,
  plan          TEXT DEFAULT 'starter', -- starter, pro, enterprise
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_domain ON agencies(website_domain);

-- =============================================================================
-- USERS (with roles per agency)
-- =============================================================================

CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'agent',
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, agency_id)
);

CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_users_role ON users(role);

-- User invitations
CREATE TABLE user_invitations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'agent',
  token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by  UUID REFERENCES users(id),
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROPERTIES
-- =============================================================================

CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  code            TEXT NOT NULL, -- unique per agency
  slug            TEXT NOT NULL, -- SEO-friendly URL
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  price           NUMERIC(15,2) NOT NULL,
  currency        currency_type NOT NULL DEFAULT 'USD',
  property_type   property_type NOT NULL,
  status          property_status NOT NULL DEFAULT 'available',
  
  -- Location
  country         TEXT DEFAULT 'Venezuela',
  state           TEXT NOT NULL,
  city            TEXT NOT NULL,
  area            TEXT,
  address         TEXT,
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  
  -- Physical attributes
  bedrooms        INT DEFAULT 0,
  bathrooms       INT DEFAULT 0,
  parking         INT DEFAULT 0,
  built_area_m2   DECIMAL(10,2),
  land_area_m2    DECIMAL(10,2),
  floors          INT DEFAULT 1,
  
  -- Array attributes
  features        TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  
  -- SEO
  meta_title      TEXT,
  meta_description TEXT,
  
  -- Cover
  cover_image_url TEXT,
  
  -- Relations
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  
  UNIQUE(agency_id, code),
  UNIQUE(agency_id, slug)
);

CREATE INDEX idx_properties_agency ON properties(agency_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created ON properties(created_at DESC);
CREATE INDEX idx_properties_search ON properties USING gin(
  to_tsvector('spanish', title || ' ' || COALESCE(description, '') || ' ' || city || ' ' || state)
);
CREATE INDEX idx_properties_features ON properties USING gin(features);
CREATE INDEX idx_properties_tags ON properties USING gin(tags);

-- =============================================================================
-- PROPERTY MEDIA
-- =============================================================================

CREATE TABLE property_media (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  media_type      media_type NOT NULL,
  video_type      video_type, -- only for video
  url             TEXT NOT NULL,
  storage_path    TEXT NOT NULL, -- Supabase storage path
  thumbnail_url   TEXT,
  watermarked_url TEXT,
  is_cover        BOOLEAN DEFAULT false,
  sort_order      INT DEFAULT 0,
  width           INT,
  height          INT,
  duration_sec    INT, -- only for video
  size_bytes      BIGINT,
  mime_type       TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_property ON property_media(property_id);
CREATE INDEX idx_media_agency ON property_media(agency_id);
CREATE INDEX idx_media_cover ON property_media(property_id, is_cover);
CREATE INDEX idx_media_sort ON property_media(property_id, sort_order);

-- =============================================================================
-- CLIENTS
-- =============================================================================

CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  whatsapp        TEXT,
  notes           TEXT,
  source          TEXT, -- web, referral, instagram, facebook, etc.
  assigned_to     UUID REFERENCES users(id),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_phone ON clients(phone);

-- Client preferences for matching
CREATE TABLE client_preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  budget_min      NUMERIC(15,2),
  budget_max      NUMERIC(15,2),
  currency        currency_type DEFAULT 'USD',
  property_types  property_type[] DEFAULT '{}',
  preferred_cities TEXT[] DEFAULT '{}',
  preferred_areas  TEXT[] DEFAULT '{}',
  min_bedrooms    INT,
  max_bedrooms    INT,
  min_bathrooms   INT,
  min_area_m2     DECIMAL(10,2),
  required_features TEXT[] DEFAULT '{}',
  notes           TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

-- =============================================================================
-- META CONNECTIONS (OAuth tokens per agency)
-- =============================================================================

CREATE TABLE meta_connections (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id             UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE UNIQUE,
  user_access_token     TEXT, -- encrypted, server-side only
  page_access_token     TEXT, -- encrypted
  instagram_access_token TEXT, -- encrypted
  facebook_page_id      TEXT,
  facebook_page_name    TEXT,
  instagram_account_id  TEXT,
  instagram_username    TEXT,
  token_expires_at      TIMESTAMPTZ,
  scopes                TEXT[] DEFAULT '{}',
  is_active             BOOLEAN DEFAULT false,
  connected_by          UUID REFERENCES users(id),
  connected_at          TIMESTAMPTZ,
  last_refresh          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PUBLICATION JOBS (Social Media Automation)
-- =============================================================================

CREATE TABLE publication_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  platform        publication_platform NOT NULL,
  caption         TEXT NOT NULL,
  media_urls      TEXT[] NOT NULL DEFAULT '{}', -- resolved URLs for Meta API
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  status          publication_status NOT NULL DEFAULT 'PENDING',
  retries         INT DEFAULT 0,
  max_retries     INT DEFAULT 3,
  next_retry_at   TIMESTAMPTZ,
  meta_post_id    TEXT,
  meta_media_id   TEXT,
  error_log       TEXT,
  error_code      TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_agency ON publication_jobs(agency_id);
CREATE INDEX idx_jobs_status ON publication_jobs(status);
CREATE INDEX idx_jobs_scheduled ON publication_jobs(scheduled_at) WHERE status = 'PENDING';
CREATE INDEX idx_jobs_property ON publication_jobs(property_id);

-- =============================================================================
-- CAPTION TEMPLATES
-- =============================================================================

CREATE TABLE caption_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  platform    publication_platform,
  template    TEXT NOT NULL, -- with {{variables}}
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  action      audit_action NOT NULL,
  entity_type TEXT NOT NULL, -- 'property', 'user', 'publication', etc.
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_agency ON audit_logs(agency_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id);

-- =============================================================================
-- ANALYTICS SNAPSHOTS (daily aggregations)
-- =============================================================================

CREATE TABLE analytics_snapshots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  total_properties INT DEFAULT 0,
  available_count  INT DEFAULT 0,
  reserved_count   INT DEFAULT 0,
  sold_count       INT DEFAULT 0,
  new_properties   INT DEFAULT 0,
  publications_total INT DEFAULT 0,
  publications_success INT DEFAULT 0,
  publications_failed  INT DEFAULT 0,
  publications_by_platform JSONB DEFAULT '{}',
  new_clients      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, date)
);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON publication_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER meta_conn_updated_at BEFORE UPDATE ON meta_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
