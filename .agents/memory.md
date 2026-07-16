
# Project Memory: Devfolio CMS

## 1. System Overview & Tech Stack
- **Framework**: Next.js (App Router, React, TypeScript)
- **Styling**: Tailwind CSS & PostCSS (Styling rules defined in [DESIGN.md](file:///d:/Portfolio/My-CMS-Portfolio/DESIGN.md))
- **Database/Backend**: Supabase (PostgreSQL, auth, real-time)
- **Deployment**: Vercel / Next.js hosting

## 2. Directory Structure Map
- `.agents/`: AI customization rules and project memory (e.g. [AGENTS.md](file:///d:/Portfolio/My-CMS-Portfolio/.agents/AGENTS.md), [memory.md](file:///d:/Portfolio/My-CMS-Portfolio/.agents/memory.md))
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
- **Styling Tokens**: Follow the light/dark palette and card/button guidelines specified in [DESIGN.md](file:///d:/Portfolio/My-CMS-Portfolio/DESIGN.md).
- **Authentication**: Handled via Supabase Auth and gated using Next.js Middleware in `src/middleware.ts`.
- **Database Client**: Local migrations managed via Supabase CLI in `supabase/migrations/`.

## 4. Current Work & Goals
- [x] Add Experience achievements and Section content settings editors to the CMS admin panel
- [x] Make the Admin CMS panel fully responsive on phone and tablet devices (collapsible sidebar drawer, responsive modals, fluid layouts)
- [x] Implement drag-and-drop custom list reordering and automatic display order calculation for admin sections
- [x] Redesign admin panels to use a Two-Half Layout (Form on top, DataTable on bottom), eliminating tabs and dialog popups
- [x] Run security audit and implement RLS and middleware route guard security fixes
- [x] Implement item-level visibility toggles for avatar, skills, projects, experience, education, certifications, testimonials, and blog posts
- [x] Redesign the public-facing Hero section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Projects section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Experience section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing About section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Skills section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Education section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Certifications section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Testimonials section to use a premium, asymmetric editorial layout
- [x] Redesign the public-facing Contact section to use a premium, asymmetric editorial layout
- [ ] Initialize/validate base portfolio layout
- [ ] Connect admin panel with Supabase collections
- [ ] Verify tailwind config and design system tokens match [DESIGN.md](file:///d:/Portfolio/My-CMS-Portfolio/DESIGN.md)

## 5. Recent Decisions & Changes
- *2026-06-28*: Resolved the Skills duplicate category header bug by (1) normalizing and capitalizing category names during grouping in `skills-section.tsx` to group similar names regardless of database spacing/casing differences, and (2) implementing a dynamic `<datalist>` dropdown in the skills admin page (`/admin/skills`) showing all unique existing categories while still allowing custom typing for new ones.
- *2026-06-28*: Audited the codebase and resolved two issues: (1) Added `"blog_posts"` to the `standardTypes` array inside `/admin/sections` save action to fix a bug where Blog CMS customization inputs were discarded, and (2) converted `CustomSection` to a Client Component using `marked.parse` asynchronously with React hooks to render `body_markdown` properly as rich HTML.
- *2026-06-28*: Increased the mobile avatar's width by 12% in `src/components/portfolio/sections/hero-section.tsx` (to `w-[42%] sm:w-[37%]`) and updated the text padding to `pr-[44%] sm:pr-[40%]` to prevent text overlaps. Scaled the display name font-size dynamically on mobile viewports (`text-[10vw] sm:text-7xl`) to prevent long names from overflowing and clipping into the absolute-positioned avatar on small screens. Relocated the parent container padding `p-6` to the inner text div to let the absolute mobile avatar stretch flush against the top, bottom, and right borders of the gridbox, removing all padding/gaps. Shifted overlays to `bottom-6 left-3` with size `text-[7.5px]` to prevent text truncation/glitches.
- *2026-06-28*: Integrated a new `"blog_posts"` section type. Implemented auto-seeding in `/admin/sections` so the Blog row is automatically added if missing, created a content editor UI form for customizer properties, built a matching brutalist homepage `BlogPostsSection` previewing recent posts, and configured navigation headers to dynamically toggle the Blog subpage link visibility based on the section's active state.
- *2026-06-28*: Implemented separate Avatar URLs and visibility toggles for the Hero and About sections inside **General Settings** (`src/app/admin/(protected)/settings/general/page.tsx`). Merged the new columns directly into the master database schema file `supabase/migrations/20240101000000_initial_schema.sql` and deleted the temporary migration script.
- *2026-06-28*: Created and integrated a client-side floating `BackToTopButton` component in the public portfolio layout (`src/app/(portfolio)/layout.tsx`), styled with a flat brutalist drop-shadow matching the portfolio theme and appearing on scroll past 300px.
- *2026-06-28*: Updated `src/components/portfolio/sections/skills-section.tsx` to support dynamic Lucide icon rendering based on the `icon_name` database field, and enabled skill-wise proficiency text and visual indicator bars in the default "tags" display style.
- *2026-06-28*: Structurally and typographically aligned Year/Date column in `src/components/portfolio/sections/education-section.tsx` with `src/components/portfolio/sections/experience-section.tsx`. Upgraded Year text size to `text-3xl sm:text-4xl md:text-5xl` and changed the wrapper to a compact top-grouped layout (`justify-start space-y-2`) matching the Experience layout.
- *2026-06-27*: Redesigned the public-facing `HeroSection` (`src/components/portfolio/sections/hero-section.tsx`) to match the editorial split layout. Shifted elements into an auto-scaling 2-column split grid (`lg:grid-cols-[1fr_18.5%]`), applied the custom `'Victory Striker Sans Demo'` font to the name, removed the biography description fallback (showing only CMS `headline` and `subheading`), built side-by-side actions, and compressed the avatar to a tall `aspect-[8/20]` crop at a narrow 18.5% width.
- *2026-06-27*: Expanded the CMS admin panel by exposing missing displayable items. Updated the Experience admin page (`src/app/admin/(protected)/experience/page.tsx`) to support newline-separated achievementsText textareas and parsed them back to database string arrays on submit. Created a dynamic Section Content Editor dialog in `src/app/admin/(protected)/sections/page.tsx` mapping options for Hero, About, Projects, Skills, and Contact schemas directly to the `sections.content` JSONB column.
- *2026-06-27*: Redesigned the public-facing `ContactSection` (`src/components/portfolio/sections/contact-section.tsx`) to implement an industrial terminal form. Placed contents inside an interlocking grid split layout, customized form components to be sharp-edged (`rounded-none`) and monospaced, styled submit buttons as full-width blocks, and turned the success status panel into a custom green monospace terminal screen.
- *2026-06-27*: Redesigned the public-facing `TestimonialsSection` (`src/components/portfolio/sections/testimonials-section.tsx`) to implement a stark typographic pull-quote ledger. Stripped out distinct card backgrounds, enclosing reviews in a flat vertical stack divided by severe 1px solid borders (`border-border`). Placed a massive, background quote character (`”`) with low opacity (`text-foreground/[0.03]`) inside each block, and locked author profile pictures inside square bordered wrappers.
- *2026-06-27*: Redesigned the public-facing `CertificationsSection` (`src/components/portfolio/sections/certifications-section.tsx`) to implement a brutalist "Credential Matrix". Grouped certification entries inside a `border-t border-l border-border` container utilizing `gap-0` to eliminate double borders. Rendered issuer icons in square geometric borders (`border-border`) with grayscale filter transitions, and formatted skills as raw monospaced string data blocks.
- *2026-06-27*: Redesigned the public-facing `EducationSection` (`src/components/portfolio/sections/education-section.tsx`) to implement a brutalist academic ledger. Grouped entries inside a `border-t border-border` container, divided by horizontal `border-b border-border` lines. Displayed degree and field in a massive, imposing uppercase typographic scale, and locked tiny monospaced metadata and grade indices (`GRADE_SPEC`) to the corner cells.
- *2026-06-27*: Redesigned the public-facing `SkillsSection` (`src/components/portfolio/sections/skills-section.tsx`) to implement a brutalist "Technical Spec Sheet". Handled grouping into interlocking category ledger blocks. Added support for periodic-table snapping tiles (`gap-[1px] bg-border`) when display style is set to tags, and harsh, segmented geometric block grids (5-square LED status indicators) for other proficiency styles.
- *2026-06-27*: Redesigned the public-facing `AboutSection` (`src/components/portfolio/sections/about-section.tsx`) to implement a stark editorial profile spread. Forced the profile avatar inside a sharp square border wrapper with a grayscale photo filter that transitions to color on hover. Added support for parsing and splitting the bio into an oversized, lead-in paragraph and flat interlocking resume action cells.
- *2026-06-27*: Redesigned the public-facing `ExperienceSection` (`src/components/portfolio/sections/experience-section.tsx`) to implement a brutalist, high-contrast typographic ledger. Created stacked full-width rows divided by severe 1px solid borders (`border-border`), and used oversized monospaced date ranges (`2024 // PRES`) as anchors for position descriptions and deliverable lists.
- *2026-06-27*: Redesigned the public-facing `ProjectsSection` (`src/components/portfolio/sections/projects-section.tsx`) to implement a brutalist, asymmetrical editorial matrix. Added support for interlocking 1px spreadsheet-style grid border matrices (`gap-0`) and alternating list/row entries using order classes. Built custom geometric controls for the image slider (stacked square arrows, clickable top-right grid dot selectors).
- *2026-06-27*: Redesigned the public-facing `HeroSection` (`src/components/portfolio/sections/hero-section.tsx`) to implement an asymmetric, brutalist editorial magazine layout. Leveraged structural borders (`border-border`), high-contrast typography scale (display name in `text-4xl` to `text-[7rem]`), grayscale avatar scaling, and dynamic layout cells for primary CTA & resume files.
- *2026-06-27*: Integrated a global skeleton loader screen in the admin dashboard by creating a native Next.js [loading.tsx](file:///d:/Portfolio/My-CMS-Portfolio/src/app/admin/(protected)/loading.tsx) component. This provides visual layout blocks that pulse during client navigation transitions.
- *2026-06-27*: Made the Admin CMS interface fully responsive. Introduced a slide-out mobile drawer for [AdminSidebar](file:///d:/Portfolio/My-CMS-Portfolio/src/components/admin/layout/sidebar.tsx) backed by a Zustand mobile menu store, added a hamburger toggle to [AdminHeader](file:///d:/Portfolio/My-CMS-Portfolio/src/components/admin/layout/header.tsx), and standardized dialog dialog containers across the dashboard to scale fluidly (`w-[92vw]`).
- *2026-06-27*: Implemented native HTML5 drag-and-drop row reordering in the [DataTable](file:///d:/Portfolio/My-CMS-Portfolio/src/components/admin/ui/data-table.tsx) component with active visual boundary cues. Automated display order computation for new inserts and removed manual display order input fields from Skills, Projects, Experience, Education, Certifications, and Testimonial forms.
- *2026-06-27*: Optimized spacing and layout columns on all 7 redesigned admin pages (Skills, Projects, Experience, Education, Certifications, Testimonials, Blog). Increased form widths to `max-w-5xl`/`max-w-6xl` and rearranged fields into 3-4 columns, pulling the bottom table up and filling horizontal space.
- *2026-06-27*: Redesigned all 7 admin pages (Skills, Projects, Experience, Education, Certifications, Testimonials, Blog) to use a unified two-half screen layout where creation/editing forms occupy the top card and the data table occupies the bottom card, matching the requested layout.
- *2026-06-27*: Conducted second-pass security audit. Resolved Open Redirect vulnerability in [route.ts](file:///d:/Portfolio/My-CMS-Portfolio/src/app/auth/callback/route.ts) by validating redirect path targets.
- *2026-06-27*: Consolidated all schema modifications (visibility columns, updated RLS policies) directly into the unified [20240101000000_initial_schema.sql](file:///d:/Portfolio/My-CMS-Portfolio/supabase/migrations/20240101000000_initial_schema.sql) file.
- *2026-06-27*: Conducted security audit. Hardened RLS policies for anonymous queries to respect `is_visible` column statuses, and fixed password reset flow in `src/middleware.ts` by excluding `/admin/reset-password` from authentication redirects.
- *2026-06-27*: Implemented item-level visibility toggles (`is_visible` and `is_avatar_visible`) across the database schema, type definitions, frontend component queries, and admin dashboard forms.
- *2026-06-27*: Created Project memory system `.agents/AGENTS.md` and `.agents/memory.md` to optimize agent context and token usage.





