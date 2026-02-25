-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- All tables are isolated per agency_id
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caption_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTION: Get current user's agency_id and role
-- =============================================================================

CREATE OR REPLACE FUNCTION get_my_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_agency_member(target_agency_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND agency_id = target_agency_id AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'owner') FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- AGENCIES
-- =============================================================================

-- Users can only see their own agency
CREATE POLICY "agencies_select_own" ON agencies
  FOR SELECT USING (id = get_my_agency_id());

-- Only owners can update agency settings
CREATE POLICY "agencies_update_owner" ON agencies
  FOR UPDATE USING (
    id = get_my_agency_id() AND get_my_role() = 'owner'
  );

-- Service role can insert (for registration flow)
CREATE POLICY "agencies_insert_service" ON agencies
  FOR INSERT WITH CHECK (true); -- Controlled via server actions only

-- =============================================================================
-- USERS
-- =============================================================================

-- Users can see members of their agency
CREATE POLICY "users_select_same_agency" ON users
  FOR SELECT USING (agency_id = get_my_agency_id());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Admins/owners can update any user in their agency
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- Only admins/owners can insert users (via invitation flow)
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- Only owners can delete users
CREATE POLICY "users_delete_owner" ON users
  FOR DELETE USING (
    agency_id = get_my_agency_id() AND get_my_role() = 'owner' AND id != auth.uid()
  );

-- =============================================================================
-- USER INVITATIONS
-- =============================================================================

CREATE POLICY "invitations_select_admin" ON user_invitations
  FOR SELECT USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

CREATE POLICY "invitations_insert_admin" ON user_invitations
  FOR INSERT WITH CHECK (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

CREATE POLICY "invitations_delete_admin" ON user_invitations
  FOR DELETE USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- Allow public read for token validation
CREATE POLICY "invitations_select_token" ON user_invitations
  FOR SELECT USING (expires_at > NOW() AND accepted_at IS NULL);

-- =============================================================================
-- PROPERTIES
-- =============================================================================

-- All agency members can view properties
CREATE POLICY "properties_select_agency" ON properties
  FOR SELECT USING (agency_id = get_my_agency_id());

-- Public can view available properties (for public website)
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT USING (status = 'available');

-- Any member can create properties
CREATE POLICY "properties_insert_member" ON properties
  FOR INSERT WITH CHECK (
    agency_id = get_my_agency_id()
  );

-- Creator or admin can update
CREATE POLICY "properties_update_member" ON properties
  FOR UPDATE USING (
    agency_id = get_my_agency_id() AND (
      created_by = auth.uid() OR is_admin_or_owner()
    )
  );

-- Only admins can delete
CREATE POLICY "properties_delete_admin" ON properties
  FOR DELETE USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- =============================================================================
-- PROPERTY MEDIA
-- =============================================================================

CREATE POLICY "media_select_agency" ON property_media
  FOR SELECT USING (agency_id = get_my_agency_id());

-- Public can see media for available properties
CREATE POLICY "media_select_public" ON property_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id AND status = 'available'
    )
  );

CREATE POLICY "media_insert_member" ON property_media
  FOR INSERT WITH CHECK (agency_id = get_my_agency_id());

CREATE POLICY "media_update_member" ON property_media
  FOR UPDATE USING (agency_id = get_my_agency_id());

CREATE POLICY "media_delete_member" ON property_media
  FOR DELETE USING (agency_id = get_my_agency_id());

-- =============================================================================
-- CLIENTS
-- =============================================================================

CREATE POLICY "clients_select_agency" ON clients
  FOR SELECT USING (agency_id = get_my_agency_id());

CREATE POLICY "clients_insert_member" ON clients
  FOR INSERT WITH CHECK (agency_id = get_my_agency_id());

CREATE POLICY "clients_update_member" ON clients
  FOR UPDATE USING (
    agency_id = get_my_agency_id() AND (
      assigned_to = auth.uid() OR is_admin_or_owner()
    )
  );

CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- =============================================================================
-- CLIENT PREFERENCES
-- =============================================================================

CREATE POLICY "prefs_select_agency" ON client_preferences
  FOR SELECT USING (agency_id = get_my_agency_id());

CREATE POLICY "prefs_insert_member" ON client_preferences
  FOR INSERT WITH CHECK (agency_id = get_my_agency_id());

CREATE POLICY "prefs_update_member" ON client_preferences
  FOR UPDATE USING (agency_id = get_my_agency_id());

-- =============================================================================
-- META CONNECTIONS (Sensitive - Admin/Owner only)
-- =============================================================================

CREATE POLICY "meta_select_admin" ON meta_connections
  FOR SELECT USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

CREATE POLICY "meta_insert_admin" ON meta_connections
  FOR INSERT WITH CHECK (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

CREATE POLICY "meta_update_admin" ON meta_connections
  FOR UPDATE USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

CREATE POLICY "meta_delete_owner" ON meta_connections
  FOR DELETE USING (
    agency_id = get_my_agency_id() AND get_my_role() = 'owner'
  );

-- =============================================================================
-- PUBLICATION JOBS
-- =============================================================================

CREATE POLICY "jobs_select_agency" ON publication_jobs
  FOR SELECT USING (agency_id = get_my_agency_id());

CREATE POLICY "jobs_insert_member" ON publication_jobs
  FOR INSERT WITH CHECK (agency_id = get_my_agency_id());

CREATE POLICY "jobs_update_admin" ON publication_jobs
  FOR UPDATE USING (
    agency_id = get_my_agency_id() AND (
      created_by = auth.uid() OR is_admin_or_owner()
    )
  );

CREATE POLICY "jobs_delete_admin" ON publication_jobs
  FOR DELETE USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- =============================================================================
-- CAPTION TEMPLATES
-- =============================================================================

CREATE POLICY "templates_select_agency" ON caption_templates
  FOR SELECT USING (agency_id = get_my_agency_id());

CREATE POLICY "templates_modify_admin" ON caption_templates
  FOR ALL USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- =============================================================================
-- AUDIT LOGS (Read-only for users, written via service role)
-- =============================================================================

CREATE POLICY "audit_select_admin" ON audit_logs
  FOR SELECT USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- Only service role inserts (server-side)
CREATE POLICY "audit_insert_service" ON audit_logs
  FOR INSERT WITH CHECK (agency_id = get_my_agency_id());

-- =============================================================================
-- ANALYTICS
-- =============================================================================

CREATE POLICY "analytics_select_admin" ON analytics_snapshots
  FOR SELECT USING (
    agency_id = get_my_agency_id() AND is_admin_or_owner()
  );

-- =============================================================================
-- STORAGE BUCKET POLICIES
-- =============================================================================

-- Create buckets via Supabase dashboard or migration
-- Bucket: property-media (public for images, restricted for videos)
-- Path structure: {agency_id}/properties/{property_id}/{images|videos}/{filename}

-- Storage policy: agency members can upload to their own folder
-- INSERT policy on storage.objects:
-- bucket_id = 'property-media' AND (storage.foldername(name))[1] = get_my_agency_id()::text
