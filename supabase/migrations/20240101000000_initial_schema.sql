-- ═══════════════════════════════════════════════════════════════
-- DevFolio CMS — Complete Unified Schema
-- Run via: npx supabase db reset
-- ═══════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────
-- CLEAN SLATE — safe to re-run on any database state
-- ─────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS section_history CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

DROP POLICY IF EXISTS "public_read_assets" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_assets" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_assets" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_assets" ON storage.objects;

DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS save_section_history CASCADE;
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────
-- 1. SITE SETTINGS (single row)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE site_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL DEFAULT '',
  display_name    text NOT NULL DEFAULT '',
  tagline         text NOT NULL DEFAULT '',
  bio             text NOT NULL DEFAULT '',
  avatar_url      text,
  hero_avatar_url text,
  is_hero_avatar_visible boolean NOT NULL DEFAULT true,
  about_avatar_url text,
  is_about_avatar_visible boolean NOT NULL DEFAULT true,
  resume_url      text,
  email           text,
  phone           text,
  location        text,
  available_for_work boolean DEFAULT true,
  is_avatar_visible boolean NOT NULL DEFAULT true,
  social_links    jsonb NOT NULL DEFAULT '{"github":"","linkedin":"","twitter":"","website":"","youtube":"","devto":"","hashnode":""}',
  seo_meta        jsonb NOT NULL DEFAULT '{"title":"","description":"","og_image":"","keywords":""}',
  webhook_urls    jsonb NOT NULL DEFAULT '{"discord":"","slack":"","telegram_token":"","telegram_chat_id":""}',
  theme           text NOT NULL DEFAULT 'classic',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Insert default row
INSERT INTO site_settings (full_name, display_name, tagline, bio)
VALUES ('Your Name', 'Your Name', 'Full-Stack Developer', 'Write your bio here.');

-- ─────────────────────────────────────────────────────────────────
-- 2. SECTIONS (controls which sections appear and in what order)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE sections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL CHECK (type IN (
                  'hero','about','projects','skills','experience',
                  'education','certifications','testimonials',
                  'contact','github_stats','blog_posts',
                  'open_source','achievements','custom'
                )),
  label         text NOT NULL DEFAULT '',
  subtitle      text,
  content       jsonb NOT NULL DEFAULT '{}',
  style_config  jsonb NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Default sections
INSERT INTO sections (type, label, display_order, is_visible, content) VALUES
  ('hero',         'Hero',          1,  true,  '{"headline":"","subheading":"","cta_primary_text":"View Projects","cta_primary_url":"#projects","cta_secondary_text":"Download Resume","show_avatar":true,"show_social_links":true}'),
  ('about',        'About',         2,  true,  '{"show_photo":true,"show_resume_button":true}'),
  ('projects',     'Projects',      3,  true,  '{"layout":"grid","max_items":6,"show_featured_only":false}'),
  ('skills',       'Skills',        4,  true,  '{"display_style":"tags","group_by_category":true}'),
  ('experience',   'Experience',    5,  true,  '{"layout":"timeline"}'),
  ('education',    'Education',     6,  true,  '{"layout":"cards"}'),
  ('certifications','Certifications',7, false, '{"layout":"grid"}'),
  ('testimonials', 'Testimonials',  8,  false, '{"layout":"carousel"}'),
  ('contact',      'Contact',       9,  true,  '{"show_form":true,"show_email":true,"show_social":true}');

-- ─────────────────────────────────────────────────────────────────
-- 3. PROJECTS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text UNIQUE,
  description      text,
  long_description text,
  tech_stack       text[] DEFAULT '{}',
  live_url         text,
  github_url       text,
  image_url        text,
  status           text DEFAULT 'completed' CHECK (status IN ('completed','in_progress','archived')),
  is_featured      boolean DEFAULT false,
  is_visible       boolean NOT NULL DEFAULT true,
  display_order    integer DEFAULT 0,
  start_date       date,
  end_date         date,
  seo_meta         jsonb NOT NULL DEFAULT '{"title":"","description":"","keywords":""}',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 4. SKILLS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE skills (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  category         text NOT NULL DEFAULT 'General',
  proficiency      integer DEFAULT 3 CHECK (proficiency BETWEEN 1 AND 5),
  icon_name        text,
  years_experience numeric(4,1),
  display_order    integer DEFAULT 0,
  is_visible       boolean NOT NULL DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 5. EXPERIENCE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE experience (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role          text NOT NULL,
  company       text NOT NULL,
  company_url   text,
  location      text,
  employment_type text DEFAULT 'Full-time',
  start_date    date NOT NULL,
  end_date      date,
  is_current    boolean DEFAULT false,
  is_visible    boolean NOT NULL DEFAULT true,
  description   text,
  achievements  text[],
  tech_used     text[] DEFAULT '{}',
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 6. EDUCATION
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE education (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  degree        text NOT NULL,
  field         text NOT NULL,
  institution   text NOT NULL,
  institution_url text,
  location      text,
  start_date    date,
  end_date      date,
  is_current    boolean DEFAULT false,
  is_visible    boolean NOT NULL DEFAULT true,
  grade         text,
  description   text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 7. CERTIFICATIONS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE certifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  issuer        text NOT NULL,
  issue_date    date,
  expiry_date   date,
  credential_id text,
  credential_url text,
  image_url     text,
  skills        text[] DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 8. TESTIMONIALS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE testimonials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name   text NOT NULL,
  author_role   text,
  author_company text,
  author_avatar_url text,
  content       text NOT NULL,
  rating        integer DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured   boolean DEFAULT false,
  is_visible    boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 9. CONTACT MESSAGES (form submissions from portfolio visitors)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text,
  message     text NOT NULL,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 10. SECTION HISTORY (version control for section content)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE section_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  content     jsonb NOT NULL,
  style_config jsonb NOT NULL DEFAULT '{}',
  saved_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 11. BLOG POSTS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text UNIQUE NOT NULL,
  content      text NOT NULL DEFAULT '',
  excerpt      text,
  cover_image  text,
  is_published boolean DEFAULT false,
  is_visible   boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 12. VISITOR ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text NOT NULL,
  event_type  text NOT NULL DEFAULT 'page_view',
  referrer    text,
  user_agent  text,
  created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 13. PROJECT IMAGES (Galleries)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE project_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- UPDATED_AT triggers
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- AUTO HISTORY on section save
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION save_section_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO section_history (section_id, content, style_config)
  VALUES (OLD.id, OLD.content, OLD.style_config);
  -- Keep only last 10 versions per section
  DELETE FROM section_history
  WHERE id IN (
    SELECT id FROM section_history
    WHERE section_id = OLD.id
    ORDER BY saved_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_section_history
  BEFORE UPDATE OF content, style_config ON sections
  FOR EACH ROW EXECUTE FUNCTION save_section_history();

-- ─────────────────────────────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE site_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience         ENABLE ROW LEVEL SECURITY;
ALTER TABLE education          ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images     ENABLE ROW LEVEL SECURITY;

-- Public READ/INSERT policies
CREATE POLICY "public_read_site_settings"    ON site_settings      FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_visible_sections"  ON sections           FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_projects"          ON projects           FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_skills"            ON skills             FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_experience"        ON experience         FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_education"         ON education          FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_certifications"    ON certifications     FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_testimonials"      ON testimonials       FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_insert_contact"         ON contact_messages   FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_read_posts"             ON posts              FOR SELECT TO anon USING (is_published = true AND is_visible = true);
CREATE POLICY "public_read_project_images"    ON project_images     FOR SELECT TO anon USING (true);
CREATE POLICY "public_insert_analytics"       ON analytics_events   FOR INSERT TO anon WITH CHECK (true);

-- Authenticated FULL ACCESS policies
DO $$ DECLARE
  t text;
  tables text[] := ARRAY['site_settings','sections','projects','skills','experience',
                          'education','certifications','testimonials','contact_messages','section_history',
                          'posts','analytics_events','project_images'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "auth_all_%s" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- Authenticated read all sections (including invisible)
CREATE POLICY "auth_read_all_sections" ON sections FOR SELECT TO authenticated USING (true);

-- Storage policies
CREATE POLICY "public_read_assets"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'portfolio-assets');

CREATE POLICY "auth_upload_assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-assets');

CREATE POLICY "auth_delete_assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-assets');

-- ─────────────────────────────────────────────────────────────────
-- TABLE PERMISSIONS & GRANTS
-- ─────────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

