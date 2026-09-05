-- RBAC: Staff Roles & Permissions
-- Migration 006: Create user_roles, role_scopes, role_permissions tables

-- 1. User Roles (links auth.users to system roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'club_patron', 'alumni_patron')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 2. Role Scopes (defines what a role can access)
CREATE TABLE IF NOT EXISTS role_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('club', 'alumni', 'global')),
  scope_id UUID, -- club_id for club_patron, NULL for global
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_role_id, scope_type, scope_id)
);

-- 3. Permissions (defines what each role can do)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  table_name TEXT NOT NULL,
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  scope_required TEXT CHECK (scope_required IN ('own', 'all', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, table_name)
);

-- 4. Add user_id columns for authorship tracking
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_user_id UUID REFERENCES auth.users(id);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS patron_user_id UUID REFERENCES auth.users(id);
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. Seed default permissions for each role

-- Super Admin: Full access to everything
INSERT INTO role_permissions (role, table_name, can_create, can_read, can_update, can_delete, scope_required) VALUES
('super_admin', 'articles', true, true, true, true, 'all'),
('super_admin', 'events', true, true, true, true, 'all'),
('super_admin', 'page_content', true, true, true, true, 'all'),
('super_admin', 'site_settings', true, true, true, true, 'all'),
('super_admin', 'clubs', true, true, true, true, 'all'),
('super_admin', 'club_members', true, true, true, true, 'all'),
('super_admin', 'club_posts', true, true, true, true, 'all'),
('super_admin', 'club_applications', true, true, true, true, 'all'),
('super_admin', 'alumni_profiles', true, true, true, true, 'all'),
('super_admin', 'alumni_businesses', true, true, true, true, 'all'),
('super_admin', 'class_notes', true, true, true, true, 'all'),
('super_admin', 'note_comments', true, true, true, true, 'all'),
('super_admin', 'note_likes', true, true, true, true, 'all'),
('super_admin', 'mentorship_requests', true, true, true, true, 'all'),
('super_admin', 'sports_scholarships', true, true, true, true, 'all'),
('super_admin', 'inquiries', true, true, true, true, 'all'),
('super_admin', 'donations', true, true, true, true, 'all'),
('super_admin', 'event_rsvps', true, true, true, true, 'all'),
('super_admin', 'user_roles', true, true, true, true, 'all');

-- Admin: Manage content and submissions, but not site settings or user roles
INSERT INTO role_permissions (role, table_name, can_create, can_read, can_update, can_delete, scope_required) VALUES
('admin', 'articles', true, true, true, true, 'all'),
('admin', 'events', true, true, true, true, 'all'),
('admin', 'page_content', true, true, true, true, 'all'),
('admin', 'clubs', true, true, true, true, 'all'),
('admin', 'club_members', true, true, true, true, 'all'),
('admin', 'club_posts', true, true, true, true, 'all'),
('admin', 'club_applications', true, true, true, true, 'all'),
('admin', 'alumni_profiles', true, true, true, true, 'all'),
('admin', 'alumni_businesses', true, true, true, true, 'all'),
('admin', 'class_notes', true, true, true, true, 'all'),
('admin', 'note_comments', true, true, true, true, 'all'),
('admin', 'note_likes', true, true, true, true, 'all'),
('admin', 'mentorship_requests', true, true, true, true, 'all'),
('admin', 'sports_scholarships', true, true, true, true, 'all'),
('admin', 'inquiries', true, true, true, true, 'all'),
('admin', 'donations', true, true, true, true, 'all'),
('admin', 'event_rsvps', true, true, true, true, 'all');

-- Club Patron: Manage their club(s) only
INSERT INTO role_permissions (role, table_name, can_create, can_read, can_update, can_delete, scope_required) VALUES
('club_patron', 'clubs', false, true, true, false, 'own'),
('club_patron', 'club_members', true, true, true, true, 'own'),
('club_patron', 'club_posts', true, true, true, true, 'own'),
('club_patron', 'club_applications', false, true, true, false, 'own'),
('club_patron', 'mentorship_requests', false, true, true, false, 'own'),
('club_patron', 'articles', false, true, false, false, NULL),
('club_patron', 'events', false, true, false, false, NULL),
('club_patron', 'alumni_profiles', false, true, false, false, NULL);

-- Alumni Patron: Manage alumni directory and pulse
INSERT INTO role_permissions (role, table_name, can_create, can_read, can_update, can_delete, scope_required) VALUES
('alumni_patron', 'alumni_profiles', true, true, true, true, 'all'),
('alumni_patron', 'alumni_businesses', true, true, true, true, 'all'),
('alumni_patron', 'class_notes', true, true, true, true, 'all'),
('alumni_patron', 'note_comments', true, true, true, true, 'all'),
('alumni_patron', 'note_likes', true, true, true, true, 'all'),
('alumni_patron', 'event_rsvps', false, true, true, true, 'all'),
('alumni_patron', 'articles', false, true, false, false, NULL),
('alumni_patron', 'events', false, true, false, false, NULL),
('alumni_patron', 'clubs', false, true, false, false, NULL);

-- 6. Enable RLS on all new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- user_roles: Only super_admin can manage, others can read their own
CREATE POLICY "Super admin can manage user_roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Users can read own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- role_scopes: Managed by super_admin through user_roles
CREATE POLICY "Super admin can manage role_scopes" ON role_scopes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Users can read own scopes" ON role_scopes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.id = role_scopes.user_role_id AND ur.user_id = auth.uid()
    )
  );

-- role_permissions: Read-only for all authenticated users
CREATE POLICY "Authenticated users can read permissions" ON role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Super admin can manage permissions
CREATE POLICY "Super admin can manage permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- 8. Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_role_scopes_user_role_id ON role_scopes(user_role_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_table ON role_permissions(table_name);

-- 9. Create a function to check user permissions (for RLS policies)
CREATE OR REPLACE FUNCTION check_user_permission(
  p_table_name TEXT,
  p_action TEXT,
  p_scope_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_role TEXT;
  v_scope_required TEXT;
BEGIN
  -- Get the user's role and check permission
  FOR v_role, v_scope_required IN
    SELECT ur.role, rp.scope_required
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = auth.uid()
      AND rp.table_name = p_table_name
      AND (
        (p_action = 'create' AND rp.can_create = true) OR
        (p_action = 'read' AND rp.can_read = true) OR
        (p_action = 'update' AND rp.can_update = true) OR
        (p_action = 'delete' AND rp.can_delete = true)
      )
  LOOP
    -- Check scope if required
    IF v_scope_required = 'own' AND p_scope_id IS NOT NULL THEN
      -- Check if user has scope for this specific resource
      IF EXISTS (
        SELECT 1 FROM role_scopes rs
        JOIN user_roles ur ON ur.id = rs.user_role_id
        WHERE ur.user_id = auth.uid()
          AND rs.scope_type = 'club'
          AND rs.scope_id = p_scope_id
      ) THEN
        v_has_permission := TRUE;
        EXIT;
      END IF;
    ELSIF v_scope_required = 'all' OR v_scope_required IS NULL THEN
      v_has_permission := TRUE;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_permission TO authenticated;
