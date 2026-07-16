ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_sticky_social_visible BOOLEAN NOT NULL DEFAULT true;
