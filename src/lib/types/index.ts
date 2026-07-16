// ─── Database Table Types ─────────────────────────────────────────

export type SectionType =
  | "hero" | "about" | "projects" | "skills" | "experience"
  | "education" | "certifications" | "testimonials" | "contact"
  | "github_stats" | "blog_posts" | "open_source" | "achievements" | "custom";

export type ProjectStatus = "completed" | "in_progress" | "archived";

export interface SiteSettings {
  id: string;
  full_name: string;
  display_name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  hero_avatar_url: string | null;
  is_hero_avatar_visible: boolean;
  about_avatar_url: string | null;
  is_about_avatar_visible: boolean;
  resume_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  available_for_work: boolean;
  is_avatar_visible: boolean;
  social_links: {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
    youtube: string;
    devto: string;
    hashnode: string;
    show_sticky_bar?: boolean;
  };
  seo_meta: {
    title: string;
    description: string;
    og_image: string;
    keywords: string;
    designation?: string;
    warp_config?: Record<string, any>;
  };
  webhook_urls: {
    discord: string;
    slack: string;
    telegram_token: string;
    telegram_chat_id: string;
  };
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  type: SectionType;
  label: string;
  subtitle: string | null;
  content: Record<string, unknown>;
  style_config: SectionStyleConfig;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionStyleConfig {
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  font_size?: "sm" | "md" | "lg";
  padding?: "sm" | "md" | "lg";
  max_width?: "sm" | "md" | "lg" | "full";
  animation?: "none" | "fade" | "slide" | "zoom";
}

export interface Project {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  long_description: string | null;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  image_url: string | null;
  status: ProjectStatus;
  is_featured: boolean;
  is_visible: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  seo_meta: {
    title: string;
    description: string;
    keywords: string;
  };
  project_images?: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string | null;
  years_experience: number | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  company_url: string | null;
  location: string | null;
  employment_type: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  is_visible: boolean;
  description: string | null;
  achievements: string[] | null;
  tech_used: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  institution_url: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  is_visible: boolean;
  grade: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  skills: string[];
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SectionHistory {
  id: string;
  section_id: string;
  content: Record<string, unknown>;
  style_config: SectionStyleConfig;
  saved_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  is_published: boolean;
  is_visible: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  path: string;
  event_type: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

// ─── API Response Types ───────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Form Types ───────────────────────────────────────────────────

export type SiteSettingsFormData = Omit<SiteSettings, "id" | "created_at" | "updated_at">;
export type ProjectFormData = Omit<Project, "id" | "created_at" | "updated_at" | "project_images">;
export type SkillFormData = Omit<Skill, "id" | "created_at">;
export type ExperienceFormData = Omit<Experience, "id" | "created_at" | "updated_at">;
export type EducationFormData = Omit<Education, "id" | "created_at">;
export type CertificationFormData = Omit<Certification, "id" | "created_at">;
export type TestimonialFormData = Omit<Testimonial, "id" | "created_at">;
export type BlogPostFormData = Omit<BlogPost, "id" | "created_at" | "updated_at">;
