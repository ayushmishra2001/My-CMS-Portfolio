# Project Memory: Devfolio CMS

## 1. System Overview & Tech Stack
- **Framework**: Next.js (App Router, React, TypeScript)
- **Styling**: Tailwind CSS & PostCSS (Styling rules defined in [DESIGN.md](file:///d:/Portfolio/devfolio-cms/DESIGN.md))
- **Database/Backend**: Supabase (PostgreSQL, auth, real-time)
- **Deployment**: Vercel / Next.js hosting

## 2. Directory Structure Map
- `.agents/`: AI customization rules and project memory (e.g. [AGENTS.md](file:///d:/Portfolio/devfolio-cms/.agents/AGENTS.md), [memory.md](file:///d:/Portfolio/devfolio-cms/.agents/memory.md))
- `supabase/`: Supabase Local Development files (migrations, `config.toml`)
- `src/`: Core application source
  - `app/`: Next.js App Router (Layouts & Routes)
    - `(portfolio)/`: Public portfolio display pages/routes
    - `admin/`: Admin control panel CMS interface pages
    - `auth/`: Login, signup, authentication flows
    - `api/`: Route handlers and api endpoints
  - `components/`: Modular/reusable UI components (buttons, inputs, cards)
  - `hooks/`: Custom React hooks
  - `lib/`: Shared utility functions, helper libraries, and Supabase clients
  - `styles/`: Global stylesheets and styling tokens
  - `middleware.ts`: Next.js middleware for authentication route guards
- `DESIGN.md`: Primary design guidelines, color palettes, and UI rules for consistency

## 3. Core Design & Development Decisions
- **Styling Tokens**: Follow the light/dark palette and card/button guidelines specified in [DESIGN.md](file:///d:/Portfolio/devfolio-cms/DESIGN.md).
- **Authentication**: Handled via Supabase Auth and gated using Next.js Middleware in `src/middleware.ts`.
- **Database Client**: Local migrations managed via Supabase CLI in `supabase/migrations/`.

## 4. Current Work & Goals
- [x] Make the Admin CMS panel fully responsive on phone and tablet devices (collapsible sidebar drawer, responsive modals, fluid layouts)
- [x] Implement drag-and-drop custom list reordering and automatic display order calculation for admin sections
- [x] Redesign admin panels to use a Two-Half Layout (Form on top, DataTable on bottom), eliminating tabs and dialog popups
- [x] Run security audit and implement RLS and middleware route guard security fixes
- [x] Implement item-level visibility toggles for avatar, skills, projects, experience, education, certifications, testimonials, and blog posts
- [ ] Initialize/validate base portfolio layout
- [ ] Connect admin panel with Supabase collections
- [ ] Verify tailwind config and design system tokens match [DESIGN.md](file:///d:/Portfolio/devfolio-cms/DESIGN.md)

## 5. Recent Decisions & Changes
- *2026-06-27*: Integrated a global skeleton loader screen in the admin dashboard by creating a native Next.js [loading.tsx](file:///d:/Portfolio/devfolio-cms/src/app/admin/(protected)/loading.tsx) component. This provides visual layout blocks that pulse during client navigation transitions.
- *2026-06-27*: Made the Admin CMS interface fully responsive. Introduced a slide-out mobile drawer for [AdminSidebar](file:///d:/Portfolio/devfolio-cms/src/components/admin/layout/sidebar.tsx) backed by a Zustand mobile menu store, added a hamburger toggle to [AdminHeader](file:///d:/Portfolio/devfolio-cms/src/components/admin/layout/header.tsx), and standardized dialog dialog containers across the dashboard to scale fluidly (`w-[92vw]`).
- *2026-06-27*: Implemented native HTML5 drag-and-drop row reordering in the [DataTable](file:///d:/Portfolio/devfolio-cms/src/components/admin/ui/data-table.tsx) component with active visual boundary cues. Automated display order computation for new inserts and removed manual display order input fields from Skills, Projects, Experience, Education, Certifications, and Testimonial forms.
- *2026-06-27*: Optimized spacing and layout columns on all 7 redesigned admin pages (Skills, Projects, Experience, Education, Certifications, Testimonials, Blog). Increased form widths to `max-w-5xl`/`max-w-6xl` and rearranged fields into 3-4 columns, pulling the bottom table up and filling horizontal space.
- *2026-06-27*: Redesigned all 7 admin pages (Skills, Projects, Experience, Education, Certifications, Testimonials, Blog) to use a unified two-half screen layout where creation/editing forms occupy the top card and the data table occupies the bottom card, matching the requested layout.
- *2026-06-27*: Conducted second-pass security audit. Resolved Open Redirect vulnerability in [route.ts](file:///d:/Portfolio/devfolio-cms/src/app/auth/callback/route.ts) by validating redirect path targets.
- *2026-06-27*: Consolidated all schema modifications (visibility columns, updated RLS policies) directly into the unified [20240101000000_initial_schema.sql](file:///d:/Portfolio/devfolio-cms/supabase/migrations/20240101000000_initial_schema.sql) file.
- *2026-06-27*: Conducted security audit. Hardened RLS policies for anonymous queries to respect `is_visible` column statuses, and fixed password reset flow in `src/middleware.ts` by excluding `/admin/reset-password` from authentication redirects.
- *2026-06-27*: Implemented item-level visibility toggles (`is_visible` and `is_avatar_visible`) across the database schema, type definitions, frontend component queries, and admin dashboard forms.
- *2026-06-27*: Created Project memory system `.agents/AGENTS.md` and `.agents/memory.md` to optimize agent context and token usage.
